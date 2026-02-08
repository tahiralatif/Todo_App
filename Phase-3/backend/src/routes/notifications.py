"""Notification routes for managing user notifications."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db import get_session
from src.middleware.auth import require_user
from src.models.notification import NotificationType
from src.schemas.notification import (
    NotificationCreateRequest,
    NotificationListResponse,
    NotificationResponse,
    NotificationUpdateRequest,
    MarkAllAsReadResponse
)
from src.services.notification_service import NotificationService

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("", response_model=List[NotificationResponse])
async def list_notifications(
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
    limit: int = 50,
    offset: int = 0,
    unread_only: bool = False,
) -> List[NotificationResponse]:
    """
    List all notifications for the authenticated user.
    """
    notifications = await NotificationService.get_user_notifications(
        session=session,
        user_id=user.user_id,
        limit=limit,
        offset=offset,
        unread_only=unread_only,
    )

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


@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: int,
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> NotificationResponse:
    """
    Get a specific notification by ID.
    """
    # Get all user's notifications to find the specific one
    notifications = await NotificationService.get_user_notifications(
        session=session,
        user_id=user.user_id,
        limit=1000,  # Get all to find the specific one
        offset=0,
    )

    notification = next((n for n in notifications if n.id == notification_id), None)

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
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


@router.put("/{notification_id}", response_model=NotificationResponse)
async def update_notification(
    notification_id: int,
    request: NotificationUpdateRequest,
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> NotificationResponse:
    """
    Update a notification (currently only supports marking as read/unread).
    """
    success = await NotificationService.mark_notification_as_read(
        session=session,
        notification_id=notification_id,
        user_id=user.user_id,
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )

    # Get the updated notification
    notifications = await NotificationService.get_user_notifications(
        session=session,
        user_id=user.user_id,
        limit=1000,  # Get all to find the specific one
        offset=0,
    )

    notification = next((n for n in notifications if n.id == notification_id), None)

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
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


@router.put("/mark-all-read", response_model=MarkAllAsReadResponse)
async def mark_all_notifications_as_read(
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> MarkAllAsReadResponse:
    """
    Mark all notifications for the user as read.
    """
    count = await NotificationService.mark_all_notifications_as_read(
        session=session,
        user_id=user.user_id,
    )

    return MarkAllAsReadResponse(
        message=f"{count} notifications marked as read",
        count=count,
    )


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: int,
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """
    Delete a specific notification.
    """
    success = await NotificationService.delete_notification(
        session=session,
        notification_id=notification_id,
        user_id=user.user_id,
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )