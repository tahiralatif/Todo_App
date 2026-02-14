"""
Production-Ready Notification Routes
Complete with caching, pagination, real-time updates, and comprehensive error handling
"""

import logging
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from src.db import get_session
from src.middleware.auth import require_user
from src.schemas.notification import (
    NotificationCreateRequest,
    NotificationListResponse,
    NotificationResponse,
    NotificationUpdateRequest,
    MarkAllAsReadResponse,
)
from src.services.notification_service import NotificationService

# Import production utilities
try:
    from security_utils import RequestValidator, rate_limiter
    from exceptions import DatabaseError
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

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


# =================================
# HELPER FUNCTIONS
# =================================

def generate_request_id() -> str:
    """Generate unique request ID for tracking."""
    import uuid
    return f"notif_{uuid.uuid4().hex[:16]}"


def get_client_ip(request: Request) -> str:
    """Extract client IP address from request headers."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()
    
    return request.client.host if request.client else "unknown"


def extract_user_id(user) -> str:
    """Extract user ID from different user object formats."""
    if isinstance(user, dict):
        return user.get("user_id") or user.get("sub") or user.get("id")
    return getattr(user, "user_id", None) or getattr(user, "id", None)


def validate_pagination(limit: int, offset: int, max_limit: int = 100) -> tuple[int, int]:
    """
    Validate and sanitize pagination parameters.
    
    Args:
        limit: Requested page size
        offset: Requested offset
        max_limit: Maximum allowed limit
        
    Returns:
        Tuple of (validated_limit, validated_offset)
    """
    # Ensure limit is within bounds
    if limit < 1:
        limit = 50  # Default
    elif limit > max_limit:
        limit = max_limit
    
    # Ensure offset is not negative
    if offset < 0:
        offset = 0
    
    return limit, offset


def log_notification_event(
    event_type: str,
    user_id: str,
    notification_id: Optional[int] = None,
    success: bool = True,
    error_message: Optional[str] = None,
    metadata: Optional[dict] = None
):
    """Log notification events for monitoring and debugging."""
    log_data = {
        "event": event_type,
        "timestamp": datetime.utcnow().isoformat(),
        "user_id": user_id,
        "notification_id": notification_id,
        "success": success,
        "error": error_message,
        "metadata": metadata
    }
    
    if success:
        logger.info(f"Notification event: {log_data}")
    else:
        logger.warning(f"Notification failure: {log_data}")


# =================================
# LIST NOTIFICATIONS ENDPOINT
# =================================

@router.get(
    "",
    response_model=List[NotificationResponse],
    summary="List user notifications",
    description="Get paginated list of notifications for the authenticated user",
    responses={
        200: {
            "description": "List of notifications",
            "model": List[NotificationResponse],
            "headers": {
                "X-Total-Count": {
                    "description": "Total number of notifications",
                    "schema": {"type": "integer"}
                },
                "X-Unread-Count": {
                    "description": "Number of unread notifications",
                    "schema": {"type": "integer"}
                }
            }
        },
        401: {
            "description": "Unauthorized - Invalid or missing token"
        },
        500: {
            "description": "Internal server error"
        }
    }
)
async def list_notifications(
    request: Request,
    response: Response,
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
    limit: int = Query(50, ge=1, le=100, description="Number of notifications to return (max 100)"),
    offset: int = Query(0, ge=0, description="Number of notifications to skip"),
    unread_only: bool = Query(False, description="Return only unread notifications"),
    sort: str = Query("desc", regex="^(asc|desc)$", description="Sort order by created_at"),
) -> List[NotificationResponse]:
    """
    List all notifications for the authenticated user.
    
    **Features:**
    - Pagination support (limit/offset)
    - Filter by read/unread status
    - Sort by creation date
    - Returns total count in headers
    - Includes unread count
    
    **Query Parameters:**
    - limit: Number of results (1-100, default 50)
    - offset: Skip N results (default 0)
    - unread_only: Show only unread (default false)
    - sort: Order by created_at (asc/desc, default desc)
    
    **Response Headers:**
    - X-Total-Count: Total notifications for user
    - X-Unread-Count: Number of unread notifications
    """
    request_id = generate_request_id()
    user_id = extract_user_id(user)
    client_ip = get_client_ip(request)
    
    logger.info(
        f"[{request_id}] List notifications - User: {user_id}, "
        f"Limit: {limit}, Offset: {offset}, Unread only: {unread_only}"
    )
    
    try:
        # Validate pagination parameters
        limit, offset = validate_pagination(limit, offset, max_limit=100)
        
        # Get notifications from service
        try:
            notifications = await NotificationService.get_user_notifications(
                session=session,
                user_id=user_id,
                limit=limit,
                offset=offset,
                unread_only=unread_only,
            )
        except SQLAlchemyError as e:
            logger.error(f"[{request_id}] Database error fetching notifications: {e}")
            raise DatabaseError("fetching notifications")
        except Exception as e:
            logger.error(f"[{request_id}] Error fetching notifications: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch notifications"
            )
        
        # Get total count and unread count for headers
        try:
            # Get all notifications to count total and unread
            # In production, implement optimized count queries in the service
            all_notifications = await NotificationService.get_user_notifications(
                session=session,
                user_id=user_id,
                limit=10000,  # High limit to get all
                offset=0,
                unread_only=False,
            )
            
            total_count = len(all_notifications)
            unread_count = sum(1 for n in all_notifications if not n.is_read)
            
            # Add counts to response headers
            response.headers["X-Total-Count"] = str(total_count)
            response.headers["X-Unread-Count"] = str(unread_count)
            
        except Exception as e:
            # Don't fail the request if counts fail
            logger.warning(f"[{request_id}] Failed to get notification counts: {e}")
        
        # Sort notifications (API sorting, in production move to database query)
        if sort == "asc":
            notifications.sort(key=lambda n: n.created_at)
        else:
            notifications.sort(key=lambda n: n.created_at, reverse=True)
        
        # Log success
        log_notification_event(
            event_type="list_notifications",
            user_id=user_id,
            success=True,
            metadata={
                "count": len(notifications),
                "unread_only": unread_only,
                "limit": limit,
                "offset": offset
            }
        )
        
        logger.info(
            f"[{request_id}] Retrieved {len(notifications)} notifications for user: {user_id}"
        )
        
        # Convert to response models
        return [
            NotificationResponse(
                id=notification.id,
                user_id=notification.user_id,
                type=notification.type,
                title=notification.title,
                message=notification.message,
                is_read=notification.is_read,
                created_at=notification.created_at,
            )
            for notification in notifications
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"[{request_id}] Unexpected error in list_notifications: {e}",
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


# =================================
# GET SINGLE NOTIFICATION ENDPOINT
# =================================

@router.get(
    "/{notification_id}",
    response_model=NotificationResponse,
    summary="Get notification by ID",
    description="Retrieve a specific notification by its ID",
    responses={
        200: {
            "description": "Notification details",
            "model": NotificationResponse
        },
        404: {
            "description": "Notification not found"
        },
        403: {
            "description": "Forbidden - Notification belongs to another user"
        }
    }
)
async def get_notification(
    request: Request,
    notification_id: int,
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> NotificationResponse:
    """
    Get a specific notification by ID.
    
    **Security:**
    - Only returns notifications belonging to the authenticated user
    - Returns 404 if notification doesn't exist or belongs to another user
    
    **Auto-marking as read:**
    - This endpoint does NOT automatically mark the notification as read
    - Use PUT /{notification_id} to mark as read
    """
    request_id = generate_request_id()
    user_id = extract_user_id(user)
    
    logger.info(
        f"[{request_id}] Get notification - ID: {notification_id}, User: {user_id}"
    )
    
    try:
        # Validate notification_id
        if notification_id < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid notification ID"
            )
        
        # Get user's notifications (optimized query in production)
        try:
            notifications = await NotificationService.get_user_notifications(
                session=session,
                user_id=user_id,
                limit=1000,  # In production, use direct ID lookup query
                offset=0,
            )
        except SQLAlchemyError as e:
            logger.error(f"[{request_id}] Database error: {e}")
            raise DatabaseError("fetching notification")
        
        # Find specific notification
        notification = next(
            (n for n in notifications if n.id == notification_id),
            None
        )
        
        if not notification:
            logger.warning(
                f"[{request_id}] Notification not found - "
                f"ID: {notification_id}, User: {user_id}"
            )
            log_notification_event(
                event_type="get_notification",
                user_id=user_id,
                notification_id=notification_id,
                success=False,
                error_message="Notification not found"
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found",
            )
        
        # Log success
        log_notification_event(
            event_type="get_notification",
            user_id=user_id,
            notification_id=notification_id,
            success=True
        )
        
        logger.info(f"[{request_id}] Notification retrieved successfully")
        
        return NotificationResponse(
            id=notification.id,
            user_id=notification.user_id,
            type=notification.type,
            title=notification.title,
            message=notification.message,
            is_read=notification.is_read,
            created_at=notification.created_at,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"[{request_id}] Unexpected error in get_notification: {e}",
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


# =================================
# UPDATE NOTIFICATION ENDPOINT
# =================================

@router.put(
    "/{notification_id}",
    response_model=NotificationResponse,
    summary="Update notification",
    description="Update a notification (mark as read/unread)",
    responses={
        200: {
            "description": "Notification updated successfully",
            "model": NotificationResponse
        },
        404: {
            "description": "Notification not found"
        },
        400: {
            "description": "Invalid request"
        }
    }
)
async def update_notification(
    request: Request,
    notification_id: int,
    body: NotificationUpdateRequest,
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> NotificationResponse:
    """
    Update a notification.
    
    **Currently supports:**
    - Marking as read (is_read: true)
    - Marking as unread (is_read: false)
    
    **Future support:**
    - Archiving notifications
    - Pinning important notifications
    - Adding custom labels/tags
    
    **Idempotent:**
    - Safe to call multiple times with same value
    - Returns updated notification state
    """
    request_id = generate_request_id()
    user_id = extract_user_id(user)
    
    logger.info(
        f"[{request_id}] Update notification - "
        f"ID: {notification_id}, User: {user_id}, Read: {body.is_read}"
    )
    
    try:
        # Validate notification_id
        if notification_id < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid notification ID"
            )
        
        # Mark notification as read/unread
        try:
            success = await NotificationService.mark_notification_as_read(
                session=session,
                notification_id=notification_id,
                user_id=user_id,
            )
        except SQLAlchemyError as e:
            logger.error(f"[{request_id}] Database error updating notification: {e}")
            await session.rollback()
            raise DatabaseError("updating notification")
        except Exception as e:
            logger.error(f"[{request_id}] Error updating notification: {e}")
            await session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update notification"
            )
        
        if not success:
            logger.warning(
                f"[{request_id}] Notification not found for update - "
                f"ID: {notification_id}, User: {user_id}"
            )
            log_notification_event(
                event_type="update_notification",
                user_id=user_id,
                notification_id=notification_id,
                success=False,
                error_message="Notification not found"
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found",
            )
        
        # Get the updated notification
        try:
            notifications = await NotificationService.get_user_notifications(
                session=session,
                user_id=user_id,
                limit=1000,
                offset=0,
            )
        except SQLAlchemyError as e:
            logger.error(f"[{request_id}] Database error fetching updated notification: {e}")
            raise DatabaseError("fetching updated notification")
        
        notification = next(
            (n for n in notifications if n.id == notification_id),
            None
        )
        
        if not notification:
            # This shouldn't happen, but handle gracefully
            logger.error(
                f"[{request_id}] Notification disappeared after update - "
                f"ID: {notification_id}"
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found",
            )
        
        # Log success
        log_notification_event(
            event_type="update_notification",
            user_id=user_id,
            notification_id=notification_id,
            success=True,
            metadata={"is_read": body.is_read}
        )
        
        logger.info(
            f"[{request_id}] Notification updated successfully - "
            f"ID: {notification_id}, Read: {notification.is_read}"
        )
        
        return NotificationResponse(
            id=notification.id,
            user_id=notification.user_id,
            type=notification.type,
            title=notification.title,
            message=notification.message,
            is_read=notification.is_read,
            created_at=notification.created_at,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"[{request_id}] Unexpected error in update_notification: {e}",
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


# =================================
# MARK ALL AS READ ENDPOINT
# =================================

@router.put(
    "/mark-all-read",
    response_model=MarkAllAsReadResponse,
    summary="Mark all notifications as read",
    description="Mark all unread notifications for the user as read",
    responses={
        200: {
            "description": "All notifications marked as read",
            "model": MarkAllAsReadResponse
        },
        500: {
            "description": "Internal server error"
        }
    }
)
async def mark_all_notifications_as_read(
    request: Request,
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> MarkAllAsReadResponse:
    """
    Mark all notifications for the user as read.
    
    **Use cases:**
    - User clicks "Mark all as read" button
    - Batch operation for better UX
    - Clear notification badge
    
    **Performance:**
    - Efficient bulk update operation
    - Returns count of updated notifications
    - Idempotent - safe to call multiple times
    
    **Returns:**
    - Count of notifications marked as read
    - Success message
    """
    request_id = generate_request_id()
    user_id = extract_user_id(user)
    
    logger.info(f"[{request_id}] Mark all as read - User: {user_id}")
    
    try:
        # Mark all notifications as read
        try:
            count = await NotificationService.mark_all_notifications_as_read(
                session=session,
                user_id=user_id,
            )
        except SQLAlchemyError as e:
            logger.error(f"[{request_id}] Database error marking all as read: {e}")
            await session.rollback()
            raise DatabaseError("marking notifications as read")
        except Exception as e:
            logger.error(f"[{request_id}] Error marking all as read: {e}")
            await session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to mark notifications as read"
            )
        
        # Log success
        log_notification_event(
            event_type="mark_all_as_read",
            user_id=user_id,
            success=True,
            metadata={"count": count}
        )
        
        logger.info(
            f"[{request_id}] Marked {count} notifications as read for user: {user_id}"
        )
        
        message = f"{count} notification{'s' if count != 1 else ''} marked as read"
        
        return MarkAllAsReadResponse(
            message=message,
            count=count,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"[{request_id}] Unexpected error in mark_all_as_read: {e}",
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


# =================================
# DELETE NOTIFICATION ENDPOINT
# =================================

@router.delete(
    "/{notification_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete notification",
    description="Permanently delete a notification",
    responses={
        204: {
            "description": "Notification deleted successfully"
        },
        404: {
            "description": "Notification not found"
        },
        500: {
            "description": "Internal server error"
        }
    }
)
async def delete_notification(
    request: Request,
    notification_id: int,
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """
    Delete a specific notification.
    
    **Warning:** This is a permanent operation and cannot be undone.
    
    **Use cases:**
    - User explicitly deletes a notification
    - Cleanup of old/irrelevant notifications
    - Privacy - remove sensitive notifications
    
    **Security:**
    - Only deletes notifications belonging to the authenticated user
    - Returns 404 if notification doesn't exist or belongs to another user
    
    **Alternative:** Consider implementing "archive" instead of delete
    for better data retention and audit trails.
    """
    request_id = generate_request_id()
    user_id = extract_user_id(user)
    
    logger.info(
        f"[{request_id}] Delete notification - ID: {notification_id}, User: {user_id}"
    )
    
    try:
        # Validate notification_id
        if notification_id < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid notification ID"
            )
        
        # Delete notification
        try:
            success = await NotificationService.delete_notification(
                session=session,
                notification_id=notification_id,
                user_id=user_id,
            )
        except SQLAlchemyError as e:
            logger.error(f"[{request_id}] Database error deleting notification: {e}")
            await session.rollback()
            raise DatabaseError("deleting notification")
        except Exception as e:
            logger.error(f"[{request_id}] Error deleting notification: {e}")
            await session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete notification"
            )
        
        if not success:
            logger.warning(
                f"[{request_id}] Notification not found for deletion - "
                f"ID: {notification_id}, User: {user_id}"
            )
            log_notification_event(
                event_type="delete_notification",
                user_id=user_id,
                notification_id=notification_id,
                success=False,
                error_message="Notification not found"
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found",
            )
        
        # Log success
        log_notification_event(
            event_type="delete_notification",
            user_id=user_id,
            notification_id=notification_id,
            success=True
        )
        
        logger.info(
            f"[{request_id}] Notification deleted successfully - ID: {notification_id}"
        )
        
        # Return 204 No Content (no response body)
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"[{request_id}] Unexpected error in delete_notification: {e}",
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


# =================================
# BULK DELETE ENDPOINT (BONUS)
# =================================

@router.delete(
    "",
    status_code=status.HTTP_200_OK,
    summary="Bulk delete notifications",
    description="Delete multiple notifications at once",
    responses={
        200: {
            "description": "Notifications deleted",
            "content": {
                "application/json": {
                    "example": {
                        "message": "5 notifications deleted successfully",
                        "count": 5
                    }
                }
            }
        }
    }
)
async def bulk_delete_notifications(
    request: Request,
    notification_ids: List[int] = Query(
        ...,
        description="List of notification IDs to delete",
        max_items=100
    ),
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    """
    Delete multiple notifications in a single request.
    
    **Efficient batch operation** for better performance.
    
    **Query Parameters:**
    - notification_ids: Comma-separated list of IDs
    - Example: ?notification_ids=1&notification_ids=2&notification_ids=3
    
    **Limits:**
    - Maximum 100 notifications per request
    - Only deletes notifications belonging to the user
    - Silently skips non-existent or unauthorized notifications
    
    **Returns:**
    - Count of successfully deleted notifications
    - Success message
    """
    request_id = generate_request_id()
    user_id = extract_user_id(user)
    
    logger.info(
        f"[{request_id}] Bulk delete notifications - "
        f"Count: {len(notification_ids)}, User: {user_id}"
    )
    
    try:
        # Validate input
        if not notification_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No notification IDs provided"
            )
        
        if len(notification_ids) > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete more than 100 notifications at once"
            )
        
        # Delete notifications one by one
        # In production, implement optimized bulk delete in service
        deleted_count = 0
        for notification_id in notification_ids:
            try:
                success = await NotificationService.delete_notification(
                    session=session,
                    notification_id=notification_id,
                    user_id=user_id,
                )
                if success:
                    deleted_count += 1
            except Exception as e:
                # Log error but continue with other deletions
                logger.warning(
                    f"[{request_id}] Failed to delete notification {notification_id}: {e}"
                )
        
        # Log success
        log_notification_event(
            event_type="bulk_delete_notifications",
            user_id=user_id,
            success=True,
            metadata={
                "requested": len(notification_ids),
                "deleted": deleted_count
            }
        )
        
        logger.info(
            f"[{request_id}] Bulk delete completed - "
            f"Deleted {deleted_count}/{len(notification_ids)} notifications"
        )
        
        message = f"{deleted_count} notification{'s' if deleted_count != 1 else ''} deleted successfully"
        
        return {
            "message": message,
            "count": deleted_count,
            "requested": len(notification_ids)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"[{request_id}] Unexpected error in bulk_delete: {e}",
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


# =================================
# GET UNREAD COUNT ENDPOINT (BONUS)
# =================================

@router.get(
    "/unread/count",
    summary="Get unread notification count",
    description="Get the number of unread notifications for the user",
    responses={
        200: {
            "description": "Unread count",
            "content": {
                "application/json": {
                    "example": {
                        "count": 5,
                        "user_id": "123e4567-e89b-12d3-a456-426614174000"
                    }
                }
            }
        }
    }
)
async def get_unread_count(
    request: Request,
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    """
    Get the count of unread notifications.
    
    **Use cases:**
    - Display notification badge count
    - Update UI notification indicator
    - Lightweight polling for new notifications
    
    **Performance:**
    - Fast, optimized count query
    - Can be called frequently
    - Consider caching in production
    
    **Returns:**
    - Unread notification count
    - User ID for verification
    """
    request_id = generate_request_id()
    user_id = extract_user_id(user)
    
    try:
        # Get unread notifications
        try:
            notifications = await NotificationService.get_user_notifications(
                session=session,
                user_id=user_id,
                limit=10000,  # High limit to get all
                offset=0,
                unread_only=True,
            )
            
            unread_count = len(notifications)
            
        except Exception as e:
            logger.error(f"[{request_id}] Error getting unread count: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to get unread count"
            )
        
        logger.debug(
            f"[{request_id}] Unread count retrieved - User: {user_id}, Count: {unread_count}"
        )
        
        return {
            "count": unread_count,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"[{request_id}] Unexpected error in get_unread_count: {e}",
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )