"""
Background scheduler for sending task due date notifications.
Checks for upcoming tasks and sends notifications to users.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import List

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from src.db import get_session
from src.models.user import Task, Notification, PushSubscription
from src.services.notification_service import NotificationService
from src.services.push_notification_service import get_push_service

logger = logging.getLogger(__name__)


class NotificationScheduler:
    """Background scheduler for task notifications."""
    
    def __init__(self):
        self.running = False
        self.check_interval = 10  # Check every 10 seconds for testing (change to 60 for production)
        
    async def start(self):
        """Start the notification scheduler."""
        self.running = True
        logger.info("Notification scheduler started")
        
        while self.running:
            try:
                await self.check_and_send_notifications()
            except Exception as e:
                logger.error(f"Error in notification scheduler: {e}", exc_info=True)
            
            # Wait before next check
            await asyncio.sleep(self.check_interval)
    
    def stop(self):
        """Stop the notification scheduler."""
        self.running = False
        logger.info("Notification scheduler stopped")
    
    async def check_and_send_notifications(self):
        """Check for tasks due soon and send notifications."""
        async for session in get_session():
            try:
                # Get tasks due in the next 15 minutes
                # Use UTC time since database stores UTC timestamps
                from datetime import timezone
                now = datetime.now(timezone.utc).replace(tzinfo=None)
                notification_window_start = now
                notification_window_end = now + timedelta(minutes=15)
                
                logger.info(f"Checking for tasks due between {notification_window_start} UTC and {notification_window_end} UTC")
                
                # Find tasks that:
                # 1. Are not completed
                # 2. Are not deleted
                # 3. Have a due_date in the next 15 minutes
                # 4. Haven't been notified yet (we'll track this)
                
                statement = select(Task).where(
                    and_(
                        Task.completed == False,
                        Task.is_deleted == False,
                        Task.due_date.isnot(None),
                        Task.due_date >= notification_window_start,
                        Task.due_date <= notification_window_end
                    )
                )
                
                result = await session.execute(statement)
                tasks = result.scalars().all()
                
                logger.info(f"Found {len(tasks)} tasks due soon")
                
                for task in tasks:
                    # Check if we already sent a notification for this task
                    if await self.has_due_notification(session, task.id):
                        logger.debug(f"Notification already sent for task {task.id}")
                        continue
                    
                    # Calculate time until due
                    time_until_due = task.due_date - now
                    minutes_until_due = int(time_until_due.total_seconds() / 60)
                    
                    # Create notification message
                    if minutes_until_due <= 0:
                        message = f"Task '{task.title}' is due now!"
                    elif minutes_until_due == 1:
                        message = f"Task '{task.title}' is due in 1 minute!"
                    else:
                        message = f"Task '{task.title}' is due in {minutes_until_due} minutes!"
                    
                    # Create in-app notification
                    notification = Notification(
                        user_id=task.user_id,
                        task_id=task.id,
                        type="TASK_DUE_SOON",
                        title="Task Due Soon",
                        message=message,
                        is_read=False
                    )
                    
                    session.add(notification)
                    logger.info(f"Created due notification for task {task.id}: {message}")
                    
                    # Send browser push notification
                    await self.send_push_notification(session, task, minutes_until_due)
                
                await session.commit()
                
            except Exception as e:
                logger.error(f"Error checking tasks for notifications: {e}", exc_info=True)
                await session.rollback()
    
    async def has_due_notification(self, session: AsyncSession, task_id: int) -> bool:
        """Check if a due notification already exists for this task."""
        statement = select(Notification).where(
            and_(
                Notification.task_id == task_id,
                Notification.type == "TASK_DUE_SOON"
            )
        )
        result = await session.execute(statement)
        notification = result.scalar_one_or_none()
        return notification is not None
    
    async def send_push_notification(self, session: AsyncSession, task: Task, minutes_until_due: int):
        """Send browser push notification for task due soon."""
        try:
            # Get user's push subscriptions
            statement = select(PushSubscription).where(
                PushSubscription.user_id == task.user_id
            )
            result = await session.execute(statement)
            subscriptions = result.scalars().all()
            
            if not subscriptions:
                logger.debug(f"No push subscriptions found for user {task.user_id}")
                return
            
            # Prepare push notification service
            push_service = get_push_service()
            
            # Send to all subscriptions
            for sub in subscriptions:
                subscription_info = {
                    "endpoint": sub.endpoint,
                    "keys": {
                        "p256dh": sub.p256dh,
                        "auth": sub.auth
                    }
                }
                
                # Send push notification
                success = await asyncio.to_thread(
                    push_service.send_task_notification,
                    [subscription_info],
                    task.title,
                    "due_soon",
                    minutes_until_due
                )
                
                if success:
                    logger.info(f"Sent push notification for task {task.id} to user {task.user_id}")
                else:
                    logger.warning(f"Failed to send push notification for task {task.id}")
                    
        except Exception as e:
            logger.error(f"Error sending push notification: {e}", exc_info=True)


# Global scheduler instance
scheduler = NotificationScheduler()


async def start_scheduler():
    """Start the notification scheduler in the background."""
    asyncio.create_task(scheduler.start())


def stop_scheduler():
    """Stop the notification scheduler."""
    scheduler.stop()
