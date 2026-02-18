"""Push subscription routes for browser push notifications."""

import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from src.db import get_session
from src.middleware.auth import require_user
from src.models.user import PushSubscription
from src.schemas.push_subscription import (
    PushSubscriptionCreate,
    PushSubscriptionResponse,
    PushTestRequest
)
from src.services.push_notification_service import get_push_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/push", tags=["push-notifications"])


@router.post("/subscribe", response_model=PushSubscriptionResponse, status_code=status.HTTP_201_CREATED)
async def subscribe_to_push(
    request: PushSubscriptionCreate,
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
):
    """
    Subscribe to push notifications.
    
    Saves the user's push subscription for sending browser notifications.
    """
    try:
        # Check if subscription already exists
        statement = select(PushSubscription).where(
            PushSubscription.user_id == user.user_id,
            PushSubscription.endpoint == request.endpoint
        )
        result = await session.execute(statement)
        existing = result.scalar_one_or_none()
        
        if existing:
            # Update existing subscription
            existing.p256dh = request.keys.p256dh
            existing.auth = request.keys.auth
            await session.commit()
            await session.refresh(existing)
            
            logger.info(f"Updated push subscription for user {user.user_id}")
            return PushSubscriptionResponse(
                id=existing.id,
                user_id=existing.user_id,
                endpoint=existing.endpoint,
                p256dh=existing.p256dh,
                auth=existing.auth,
                created_at=existing.created_at.isoformat()
            )
        
        # Create new subscription
        subscription = PushSubscription(
            user_id=user.user_id,
            endpoint=request.endpoint,
            p256dh=request.keys.p256dh,
            auth=request.keys.auth
        )
        
        session.add(subscription)
        await session.commit()
        await session.refresh(subscription)
        
        logger.info(f"Created push subscription for user {user.user_id}")
        return PushSubscriptionResponse(
            id=subscription.id,
            user_id=subscription.user_id,
            endpoint=subscription.endpoint,
            p256dh=subscription.p256dh,
            auth=subscription.auth,
            created_at=subscription.created_at.isoformat()
        )
        
    except Exception as e:
        logger.error(f"Failed to create push subscription: {e}")
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create push subscription"
        )


@router.delete("/unsubscribe", status_code=status.HTTP_204_NO_CONTENT)
async def unsubscribe_from_push(
    endpoint: str,
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
):
    """
    Unsubscribe from push notifications.
    
    Removes the user's push subscription.
    """
    try:
        statement = delete(PushSubscription).where(
            PushSubscription.user_id == user.user_id,
            PushSubscription.endpoint == endpoint
        )
        result = await session.execute(statement)
        await session.commit()
        
        if result.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subscription not found"
            )
        
        logger.info(f"Deleted push subscription for user {user.user_id}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete push subscription: {e}")
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete push subscription"
        )


@router.get("/subscriptions", response_model=List[PushSubscriptionResponse])
async def get_user_subscriptions(
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
):
    """
    Get all push subscriptions for the authenticated user.
    """
    try:
        statement = select(PushSubscription).where(
            PushSubscription.user_id == user.user_id
        )
        result = await session.execute(statement)
        subscriptions = result.scalars().all()
        
        return [
            PushSubscriptionResponse(
                id=sub.id,
                user_id=sub.user_id,
                endpoint=sub.endpoint,
                p256dh=sub.p256dh,
                auth=sub.auth,
                created_at=sub.created_at.isoformat()
            )
            for sub in subscriptions
        ]
        
    except Exception as e:
        logger.error(f"Failed to get push subscriptions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get push subscriptions"
        )


@router.post("/test", status_code=status.HTTP_200_OK)
async def test_push_notification(
    request: PushTestRequest,
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
):
    """
    Send a test push notification to all user's subscriptions.
    """
    try:
        # Get user's subscriptions
        statement = select(PushSubscription).where(
            PushSubscription.user_id == user.user_id
        )
        result = await session.execute(statement)
        subscriptions = result.scalars().all()
        
        if not subscriptions:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No push subscriptions found. Please enable notifications first."
            )
        
        # Send test notification to all subscriptions
        push_service = get_push_service()
        success_count = 0
        
        for sub in subscriptions:
            subscription_info = {
                "endpoint": sub.endpoint,
                "keys": {
                    "p256dh": sub.p256dh,
                    "auth": sub.auth
                }
            }
            
            if push_service.send_push_notification(
                subscription_info=subscription_info,
                title=request.title,
                message=request.message,
                url="/dashboard/tasks",
                tag="test-notification"
            ):
                success_count += 1
        
        return {
            "message": f"Test notification sent to {success_count}/{len(subscriptions)} subscriptions",
            "success_count": success_count,
            "total_subscriptions": len(subscriptions)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to send test notification: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send test notification"
        )

