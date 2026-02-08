"""WebSocket routes for real-time notifications."""

import json
from typing import Dict, List
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect

from src.middleware.auth import verify_jwt_token
from src.services.notification_service import NotificationService
from src.db import get_session
from sqlalchemy.ext.asyncio import AsyncSession

import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Store active WebSocket connections: {user_id: [websocket_connections]}
active_connections: Dict[str, List[WebSocket]] = {}


async def get_user_from_token(websocket: WebSocket) -> str:
    """Extract and verify JWT token from WebSocket query parameters."""
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008, reason="Missing authentication token")
        return None

    try:
        user_id = verify_jwt_token(token)
        return user_id
    except Exception as e:
        logger.warning(f"WebSocket authentication failed: {e}")
        await websocket.close(code=1008, reason="Invalid authentication token")
        return None


async def notify_user(user_id: str, notification_data: dict):
    """Send notification to all active connections for a user."""
    if user_id in active_connections:
        # Prepare notification message
        message = {
            "type": "notification",
            "data": notification_data
        }

        # Send to all connections for this user
        disconnected = []
        for websocket in active_connections[user_id]:
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.warning(f"Failed to send notification to user {user_id}: {e}")
                disconnected.append(websocket)

        # Remove disconnected websockets
        for ws in disconnected:
            if ws in active_connections[user_id]:
                active_connections[user_id].remove(ws)


@router.websocket("/ws/notifications")
async def websocket_notifications(
    websocket: WebSocket,
    session: AsyncSession = Depends(get_session)
):
    """WebSocket endpoint for real-time notifications."""
    await websocket.accept()

    user_id = await get_user_from_token(websocket)
    if not user_id:
        return

    # Add connection to active connections
    if user_id not in active_connections:
        active_connections[user_id] = []
    active_connections[user_id].append(websocket)

    logger.info(f"WebSocket connection established for user {user_id}")

    try:
        # Send welcome message
        await websocket.send_json({
            "type": "connected",
            "message": "Connected to real-time notifications",
            "user_id": user_id
        })

        # Keep connection alive and handle incoming messages
        while True:
            try:
                # Wait for messages from client (ping/pong or other commands)
                data = await websocket.receive_json()

                # Handle ping messages to keep connection alive
                if data.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})

            except json.JSONDecodeError:
                # Ignore invalid JSON, continue listening
                continue

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for user {user_id}")

    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")

    finally:
        # Remove connection from active connections
        if user_id in active_connections and websocket in active_connections[user_id]:
            active_connections[user_id].remove(websocket)

            # Clean up empty lists
            if not active_connections[user_id]:
                del active_connections[user_id]

        logger.info(f"WebSocket connection cleaned up for user {user_id}")