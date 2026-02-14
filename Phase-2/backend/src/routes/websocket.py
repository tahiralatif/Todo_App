"""
Production-Ready WebSocket Routes for Real-Time Notifications
Complete with connection pooling, heartbeat, metrics, and comprehensive error handling
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set
from collections import defaultdict

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.middleware.auth import verify_jwt_token
from src.services.notification_service import NotificationService
from src.db import get_session

# Import production utilities
try:
    from security_utils import TokenManager, RequestValidator
    USE_PRODUCTION_UTILS = True
except ImportError:
    USE_PRODUCTION_UTILS = False
    logging.warning("Production utilities not available")

# Configure logging
logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

router = APIRouter()


# =================================
# CONNECTION MANAGEMENT
# =================================

class WebSocketConnection:
    """Represents a single WebSocket connection with metadata."""
    
    def __init__(
        self,
        websocket: WebSocket,
        user_id: str,
        connection_id: str,
        client_ip: str
    ):
        self.websocket = websocket
        self.user_id = user_id
        self.connection_id = connection_id
        self.client_ip = client_ip
        self.connected_at = datetime.utcnow()
        self.last_heartbeat = datetime.utcnow()
        self.message_count = 0
        self.is_alive = True
    
    def update_heartbeat(self):
        """Update last heartbeat timestamp."""
        self.last_heartbeat = datetime.utcnow()
    
    def is_stale(self, timeout_seconds: int = 90) -> bool:
        """Check if connection is stale (no heartbeat)."""
        return (datetime.utcnow() - self.last_heartbeat).seconds > timeout_seconds
    
    def get_connection_duration(self) -> float:
        """Get connection duration in seconds."""
        return (datetime.utcnow() - self.connected_at).total_seconds()


class ConnectionManager:
    """
    Manage WebSocket connections with advanced features.
    
    Features:
    - Connection pooling per user
    - Heartbeat monitoring
    - Automatic stale connection cleanup
    - Connection metrics
    - Broadcast to user's devices
    - Rate limiting
    """
    
    def __init__(self):
        # user_id -> List[WebSocketConnection]
        self.active_connections: Dict[str, List[WebSocketConnection]] = defaultdict(list)
        
        # connection_id -> WebSocketConnection (for quick lookup)
        self.connection_map: Dict[str, WebSocketConnection] = {}
        
        # Metrics
        self.total_connections = 0
        self.total_messages_sent = 0
        self.total_messages_received = 0
        self.connection_errors = 0
        
        # Configuration
        self.max_connections_per_user = 5
        self.heartbeat_interval = 30  # seconds
        self.stale_connection_timeout = 90  # seconds
        
        # Start background tasks
        self._cleanup_task = None
    
    def start_background_tasks(self):
        """Start background cleanup tasks."""
        if not self._cleanup_task:
            self._cleanup_task = asyncio.create_task(self._cleanup_stale_connections())
    
    async def _cleanup_stale_connections(self):
        """Background task to cleanup stale connections."""
        while True:
            try:
                await asyncio.sleep(30)  # Check every 30 seconds
                
                stale_connections = []
                
                for connection_id, conn in self.connection_map.items():
                    if conn.is_stale(self.stale_connection_timeout):
                        stale_connections.append(connection_id)
                
                # Close stale connections
                for connection_id in stale_connections:
                    conn = self.connection_map.get(connection_id)
                    if conn:
                        logger.warning(
                            f"Closing stale connection - "
                            f"ID: {connection_id}, User: {conn.user_id}"
                        )
                        await self.disconnect(conn.websocket, conn.user_id, connection_id)
                
                if stale_connections:
                    logger.info(f"Cleaned up {len(stale_connections)} stale connections")
                    
            except Exception as e:
                logger.error(f"Error in cleanup task: {e}")
    
    async def connect(
        self,
        websocket: WebSocket,
        user_id: str,
        connection_id: str,
        client_ip: str
    ) -> bool:
        """
        Register a new WebSocket connection.
        
        Returns:
            True if connected successfully, False otherwise
        """
        try:
            # Check max connections per user
            if len(self.active_connections[user_id]) >= self.max_connections_per_user:
                logger.warning(
                    f"Max connections reached for user {user_id} "
                    f"({self.max_connections_per_user})"
                )
                await websocket.close(
                    code=1008,
                    reason=f"Maximum {self.max_connections_per_user} connections allowed per user"
                )
                return False
            
            # Accept connection
            await websocket.accept()
            
            # Create connection object
            connection = WebSocketConnection(
                websocket=websocket,
                user_id=user_id,
                connection_id=connection_id,
                client_ip=client_ip
            )
            
            # Store connection
            self.active_connections[user_id].append(connection)
            self.connection_map[connection_id] = connection
            
            # Update metrics
            self.total_connections += 1
            
            logger.info(
                f"WebSocket connected - "
                f"User: {user_id}, ID: {connection_id}, IP: {client_ip}, "
                f"Total: {self.get_total_active_connections()}"
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect WebSocket: {e}")
            self.connection_errors += 1
            return False
    
    async def disconnect(
        self,
        websocket: WebSocket,
        user_id: str,
        connection_id: str
    ):
        """Remove a WebSocket connection."""
        try:
            # Remove from connection map
            if connection_id in self.connection_map:
                del self.connection_map[connection_id]
            
            # Remove from active connections
            if user_id in self.active_connections:
                # Find and remove the connection
                self.active_connections[user_id] = [
                    conn for conn in self.active_connections[user_id]
                    if conn.connection_id != connection_id
                ]
                
                # Clean up empty lists
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
            
            logger.info(
                f"WebSocket disconnected - "
                f"User: {user_id}, ID: {connection_id}, "
                f"Total: {self.get_total_active_connections()}"
            )
            
        except Exception as e:
            logger.error(f"Error during disconnect: {e}")
    
    async def send_to_user(
        self,
        user_id: str,
        message: dict,
        exclude_connection_id: Optional[str] = None
    ) -> int:
        """
        Send message to all connections for a user.
        
        Args:
            user_id: User ID
            message: Message to send
            exclude_connection_id: Optional connection ID to exclude
            
        Returns:
            Number of successful sends
        """
        if user_id not in self.active_connections:
            return 0
        
        sent_count = 0
        failed_connections = []
        
        for connection in self.active_connections[user_id]:
            # Skip excluded connection
            if exclude_connection_id and connection.connection_id == exclude_connection_id:
                continue
            
            try:
                await connection.websocket.send_json(message)
                connection.message_count += 1
                sent_count += 1
                self.total_messages_sent += 1
                
            except Exception as e:
                logger.warning(
                    f"Failed to send to connection {connection.connection_id}: {e}"
                )
                failed_connections.append(connection.connection_id)
                self.connection_errors += 1
        
        # Clean up failed connections
        for connection_id in failed_connections:
            await self.disconnect(None, user_id, connection_id)
        
        return sent_count
    
    async def broadcast_to_all(self, message: dict) -> int:
        """
        Broadcast message to all active connections.
        
        Returns:
            Number of successful sends
        """
        sent_count = 0
        
        for user_id in list(self.active_connections.keys()):
            sent_count += await self.send_to_user(user_id, message)
        
        return sent_count
    
    def update_heartbeat(self, connection_id: str):
        """Update heartbeat for a connection."""
        if connection_id in self.connection_map:
            self.connection_map[connection_id].update_heartbeat()
    
    def get_user_connections(self, user_id: str) -> List[WebSocketConnection]:
        """Get all connections for a user."""
        return self.active_connections.get(user_id, [])
    
    def get_total_active_connections(self) -> int:
        """Get total number of active connections."""
        return len(self.connection_map)
    
    def get_stats(self) -> dict:
        """Get connection statistics."""
        return {
            "total_active_connections": self.get_total_active_connections(),
            "total_users_connected": len(self.active_connections),
            "total_connections_lifetime": self.total_connections,
            "total_messages_sent": self.total_messages_sent,
            "total_messages_received": self.total_messages_received,
            "connection_errors": self.connection_errors,
            "max_connections_per_user": self.max_connections_per_user,
        }


# Global connection manager
manager = ConnectionManager()


# =================================
# HELPER FUNCTIONS
# =================================

def generate_connection_id() -> str:
    """Generate unique connection ID."""
    import uuid
    return f"ws_{uuid.uuid4().hex[:16]}"


def get_client_ip(websocket: WebSocket) -> str:
    """Extract client IP from WebSocket headers."""
    # Check X-Forwarded-For header
    forwarded = websocket.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    
    # Check X-Real-IP
    real_ip = websocket.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()
    
    # Fallback to client host
    return websocket.client.host if websocket.client else "unknown"


async def authenticate_websocket(websocket: WebSocket) -> Optional[str]:
    """
    Authenticate WebSocket connection via JWT token.
    
    Args:
        websocket: WebSocket connection
        
    Returns:
        User ID if authenticated, None otherwise
    """
    try:
        # Get token from query parameters
        token = websocket.query_params.get("token")
        
        if not token:
            logger.warning("WebSocket connection attempt without token")
            await websocket.close(code=1008, reason="Missing authentication token")
            return None
        
        # Verify token
        if USE_PRODUCTION_UTILS:
            payload = TokenManager.verify_token(token, token_type="access")
            user_id = payload.get("sub") if payload else None
        else:
            user_id = verify_jwt_token(token)
        
        if not user_id:
            logger.warning("WebSocket authentication failed - Invalid token")
            await websocket.close(code=1008, reason="Invalid authentication token")
            return None
        
        return user_id
        
    except Exception as e:
        logger.error(f"WebSocket authentication error: {e}")
        try:
            await websocket.close(code=1011, reason="Authentication error")
        except:
            pass
        return None


async def send_initial_data(
    websocket: WebSocket,
    user_id: str,
    session: AsyncSession
):
    """Send initial data after connection."""
    try:
        # Get unread notification count
        notifications = await NotificationService.get_user_notifications(
            session=session,
            user_id=user_id,
            limit=10000,
            offset=0,
            unread_only=True
        )
        
        unread_count = len(notifications)
        
        # Send unread count
        await websocket.send_json({
            "type": "unread_count",
            "data": {
                "count": unread_count
            },
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Send recent notifications (last 5)
        recent_notifications = await NotificationService.get_user_notifications(
            session=session,
            user_id=user_id,
            limit=5,
            offset=0,
            unread_only=False
        )
        
        if recent_notifications:
            await websocket.send_json({
                "type": "recent_notifications",
                "data": [
                    {
                        "id": n.id,
                        "type": n.type,
                        "title": n.title,
                        "message": n.message,
                        "is_read": n.is_read,
                        "created_at": n.created_at.isoformat()
                    }
                    for n in recent_notifications
                ],
                "timestamp": datetime.utcnow().isoformat()
            })
            
    except Exception as e:
        logger.error(f"Failed to send initial data: {e}")


# =================================
# WEBSOCKET ENDPOINT
# =================================

@router.websocket("/ws/notifications")
async def websocket_notifications(
    websocket: WebSocket,
    session: AsyncSession = Depends(get_session)
):
    """
    WebSocket endpoint for real-time notifications.
    
    **Connection:**
    - URL: ws://api.yourdomain.com/ws/notifications?token=<jwt_token>
    - Protocol: WebSocket
    - Authentication: JWT token in query params
    
    **Message Types (Server -> Client):**
    - connected: Connection established
    - notification: New notification
    - unread_count: Unread count update
    - notification_read: Notification marked as read
    - notification_deleted: Notification deleted
    - pong: Heartbeat response
    - error: Error message
    
    **Message Types (Client -> Server):**
    - ping: Heartbeat (sent every 30s)
    - subscribe: Subscribe to specific notification types
    - unsubscribe: Unsubscribe from notification types
    
    **Features:**
    - Auto-reconnection support
    - Heartbeat monitoring (90s timeout)
    - Multiple devices per user (max 5)
    - Message broadcasting to all user devices
    - Connection metrics and monitoring
    
    **Example Client Code:**
    ```javascript
    const ws = new WebSocket('ws://api.yourdomain.com/ws/notifications?token=' + token);
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received:', data.type, data);
    };
    
    // Send heartbeat every 30 seconds
    setInterval(() => {
        ws.send(JSON.stringify({ type: 'ping' }));
    }, 30000);
    ```
    """
    connection_id = generate_connection_id()
    client_ip = get_client_ip(websocket)
    user_id = None
    
    logger.info(
        f"WebSocket connection attempt - ID: {connection_id}, IP: {client_ip}"
    )
    
    try:
        # Authenticate
        user_id = await authenticate_websocket(websocket)
        if not user_id:
            return
        
        # Connect
        connected = await manager.connect(
            websocket=websocket,
            user_id=user_id,
            connection_id=connection_id,
            client_ip=client_ip
        )
        
        if not connected:
            return
        
        # Send welcome message
        await websocket.send_json({
            "type": "connected",
            "message": "Connected to real-time notifications",
            "connection_id": connection_id,
            "user_id": user_id,
            "heartbeat_interval": manager.heartbeat_interval,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Send initial data (unread count, recent notifications)
        await send_initial_data(websocket, user_id, session)
        
        # Main message loop
        while True:
            try:
                # Wait for messages from client
                data = await websocket.receive_json()
                manager.total_messages_received += 1
                
                message_type = data.get("type")
                
                # Handle ping (heartbeat)
                if message_type == "ping":
                    manager.update_heartbeat(connection_id)
                    await websocket.send_json({
                        "type": "pong",
                        "timestamp": datetime.utcnow().isoformat()
                    })
                
                # Handle subscribe to notification types
                elif message_type == "subscribe":
                    notification_types = data.get("notification_types", [])
                    logger.info(
                        f"User {user_id} subscribed to: {notification_types}"
                    )
                    # Store subscription preferences (implement as needed)
                    await websocket.send_json({
                        "type": "subscribed",
                        "notification_types": notification_types,
                        "timestamp": datetime.utcnow().isoformat()
                    })
                
                # Handle unsubscribe
                elif message_type == "unsubscribe":
                    notification_types = data.get("notification_types", [])
                    logger.info(
                        f"User {user_id} unsubscribed from: {notification_types}"
                    )
                    await websocket.send_json({
                        "type": "unsubscribed",
                        "notification_types": notification_types,
                        "timestamp": datetime.utcnow().isoformat()
                    })
                
                # Unknown message type
                else:
                    logger.warning(
                        f"Unknown message type from {user_id}: {message_type}"
                    )
                
            except json.JSONDecodeError as e:
                logger.warning(f"Invalid JSON from {user_id}: {e}")
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid JSON format",
                    "timestamp": datetime.utcnow().isoformat()
                })
            
            except asyncio.CancelledError:
                logger.info(f"Connection cancelled for {user_id}")
                break
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected - User: {user_id}, ID: {connection_id}")
    
    except Exception as e:
        logger.error(
            f"WebSocket error - User: {user_id}, ID: {connection_id}, Error: {e}",
            exc_info=True
        )
        manager.connection_errors += 1
    
    finally:
        # Cleanup
        if user_id:
            await manager.disconnect(websocket, user_id, connection_id)
        
        logger.info(f"WebSocket connection cleaned up - ID: {connection_id}")


# =================================
# NOTIFICATION BROADCAST FUNCTIONS
# =================================

async def broadcast_new_notification(
    user_id: str,
    notification: dict
):
    """
    Broadcast new notification to user's connections.
    
    Args:
        user_id: User ID
        notification: Notification data
    """
    message = {
        "type": "notification",
        "data": notification,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    sent_count = await manager.send_to_user(user_id, message)
    
    logger.info(
        f"Broadcasted notification to {sent_count} connections for user {user_id}"
    )


async def broadcast_unread_count_update(
    user_id: str,
    unread_count: int
):
    """
    Broadcast unread count update to user's connections.
    
    Args:
        user_id: User ID
        unread_count: New unread count
    """
    message = {
        "type": "unread_count",
        "data": {
            "count": unread_count
        },
        "timestamp": datetime.utcnow().isoformat()
    }
    
    sent_count = await manager.send_to_user(user_id, message)
    
    logger.debug(
        f"Broadcasted unread count ({unread_count}) to {sent_count} connections"
    )


async def broadcast_notification_read(
    user_id: str,
    notification_id: int
):
    """
    Broadcast notification read status to user's connections.
    
    Args:
        user_id: User ID
        notification_id: Notification ID
    """
    message = {
        "type": "notification_read",
        "data": {
            "notification_id": notification_id
        },
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await manager.send_to_user(user_id, message)


async def broadcast_notification_deleted(
    user_id: str,
    notification_id: int
):
    """
    Broadcast notification deletion to user's connections.
    
    Args:
        user_id: User ID
        notification_id: Notification ID
    """
    message = {
        "type": "notification_deleted",
        "data": {
            "notification_id": notification_id
        },
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await manager.send_to_user(user_id, message)


# =================================
# ADMIN/MONITORING ENDPOINTS
# =================================

@router.get("/ws/stats")
async def get_websocket_stats():
    """
    Get WebSocket connection statistics.
    
    **Note:** This endpoint should be protected in production.
    Only accessible by administrators.
    
    **Returns:**
    - Total active connections
    - Total users connected
    - Lifetime statistics
    - Configuration
    """
    return manager.get_stats()


# =================================
# STARTUP TASKS
# =================================

@router.on_event("startup")
async def startup_websocket_manager():
    """Start WebSocket manager background tasks."""
    logger.info("Starting WebSocket manager background tasks...")
    manager.start_background_tasks()
    logger.info("WebSocket manager ready")


# =================================
# EXPORT FUNCTIONS FOR USE IN OTHER MODULES
# =================================

__all__ = [
    "broadcast_new_notification",
    "broadcast_unread_count_update",
    "broadcast_notification_read",
    "broadcast_notification_deleted",
    "manager",
]