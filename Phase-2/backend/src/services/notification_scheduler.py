"""
Background scheduler for sending task due date notifications.
Checks for upcoming tasks and sends email notifications to users.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import List

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from src.db import get_session
from src.models.user import Task, Notification, User
from src.services.notification_service import NotificationService
from src.services.email_service import EmailService

logger = logging.getLogger(__name__)


class NotificationScheduler:
    """Background scheduler for task notifications."""
    
    def __init__(self):
        self.running = False
        self.check_interval = 60  # Check every 60 seconds
        self.email_service = EmailService()
        
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
                from datetime import timezone
                now = datetime.now(timezone.utc).replace(tzinfo=None)
                notification_window_start = now
                notification_window_end = now + timedelta(minutes=15)
                
                logger.info(f"Checking for tasks due between {notification_window_start} UTC and {notification_window_end} UTC")
                
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
                    
                    # Calculate time until due (handle timezone-aware dates)
                    task_due_date = task.due_date
                    if task_due_date.tzinfo is not None:
                        # Convert timezone-aware to naive UTC
                        task_due_date = task_due_date.replace(tzinfo=None)
                    
                    time_until_due = task_due_date - now
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
                        title="⏰ Task Due Soon",
                        message=message,
                        is_read=False
                    )
                    
                    session.add(notification)
                    logger.info(f"Created due notification for task {task.id}: {message}")
                    
                    # Send email notification
                    await self.send_email_notification(session, task, minutes_until_due)
                
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
    
    async def send_email_notification(self, session: AsyncSession, task: Task, minutes_until_due: int):
        """Send email notification for task due soon."""
        try:
            # Get user email
            statement = select(User).where(User.id == task.user_id)
            result = await session.execute(statement)
            user = result.scalar_one_or_none()
            
            if not user or not user.email:
                logger.warning(f"No email found for user {task.user_id}")
                return
            
            # Format due time message
            if minutes_until_due <= 0:
                time_msg = "now"
            elif minutes_until_due == 1:
                time_msg = "in 1 minute"
            else:
                time_msg = f"in {minutes_until_due} minutes"
            
            # Send email
            subject = f"⏰ Task Reminder: {task.title}"
            body = f"""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
                    <h1 style="color: white; margin: 0;">⏰ Task Reminder</h1>
                </div>
                
                <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-top: 20px;">
                    <h2 style="color: #333; margin-top: 0;">Your task is due {time_msg}!</h2>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
                        <h3 style="color: #667eea; margin-top: 0;">{task.title}</h3>
                        {f'<p style="color: #666; margin: 10px 0;">{task.description}</p>' if task.description else ''}
                        <p style="color: #999; font-size: 14px; margin: 10px 0;">
                            <strong>Priority:</strong> {task.priority}<br>
                            <strong>Due:</strong> {task.due_date.strftime('%B %d, %Y at %I:%M %p')}
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="http://localhost:3000/dashboard/tasks" 
                           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                  color: white; 
                                  padding: 15px 40px; 
                                  text-decoration: none; 
                                  border-radius: 8px; 
                                  display: inline-block;
                                  font-weight: bold;">
                            View Task
                        </a>
                    </div>
                </div>
                
                <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
                    This is an automated reminder from Execute Todo App
                </p>
            </body>
            </html>
            """
            
            success = await self.email_service.send_email(
                to_email=user.email,
                subject=subject,
                html_body=body
            )
            
            if success:
                logger.info(f"✅ Sent email notification to {user.email} for task {task.id}")
            else:
                logger.warning(f"❌ Failed to send email notification for task {task.id}")
                    
        except Exception as e:
            logger.error(f"Error sending email notification: {e}", exc_info=True)


# Global scheduler instance
scheduler = NotificationScheduler()


async def start_scheduler():
    """Start the notification scheduler in the background."""
    asyncio.create_task(scheduler.start())


def stop_scheduler():
    """Stop the notification scheduler."""
    scheduler.stop()
