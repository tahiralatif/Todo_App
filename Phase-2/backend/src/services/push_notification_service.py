"""
Push notification service for sending browser push notifications.
Uses Web Push protocol with VAPID authentication.
"""

import json
import logging
from typing import Optional, Dict, Any
from pywebpush import webpush, WebPushException
from py_vapid import Vapid

from src.config import settings

logger = logging.getLogger(__name__)


class PushNotificationService:
    """Service for sending browser push notifications."""
    
    def __init__(self):
        # Load VAPID keys from file
        try:
            self.vapid = Vapid.from_file(settings.vapid_key_path)
            self.vapid_claims = {
                "sub": f"mailto:{settings.support_email}"
            }
            logger.info("VAPID keys loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load VAPID keys: {e}")
            self.vapid = None
    
    def send_push_notification(
        self,
        subscription_info: Dict[str, Any],
        title: str,
        message: str,
        url: str = "/dashboard/tasks",
        task_id: Optional[int] = None,
        tag: str = "task-notification"
    ) -> bool:
        """
        Send a push notification to a user's browser.
        
        Args:
            subscription_info: Push subscription object from browser
            title: Notification title
            message: Notification message
            url: URL to open when clicked
            task_id: Optional task ID
            tag: Notification tag for grouping
            
        Returns:
            bool: True if sent successfully, False otherwise
        """
        if not self.vapid:
            logger.warning("VAPID keys not loaded, cannot send push notification")
            return False
        
        try:
            # Prepare notification payload
            payload = json.dumps({
                "title": title,
                "message": message,
                "url": url,
                "taskId": task_id,
                "tag": tag,
                "timestamp": str(int(time.time()))
            })
            
            # Send push notification
            webpush(
                subscription_info=subscription_info,
                data=payload,
                vapid_private_key=self.vapid,
                vapid_claims=self.vapid_claims
            )
            
            logger.info(f"Push notification sent successfully: {title}")
            return True
            
        except WebPushException as e:
            logger.error(f"Failed to send push notification: {e}")
            # If subscription is invalid (410 Gone), we should remove it
            if e.response and e.response.status_code == 410:
                logger.warning(f"Subscription expired or invalid: {subscription_info.get('endpoint', 'unknown')}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error sending push notification: {e}")
            return False
    
    async def send_task_notification(
        self,
        subscriptions: list,
        task_title: str,
        notification_type: str = "due_soon",
        minutes_until_due: Optional[int] = None
    ) -> int:
        """
        Send task notification to all user's subscriptions.
        
        Args:
            subscriptions: List of push subscription objects
            task_title: Title of the task
            notification_type: Type of notification (due_soon, completed, etc.)
            minutes_until_due: Minutes until task is due
            
        Returns:
            int: Number of successful sends
        """
        if not subscriptions:
            return 0
        
        # Prepare notification content based on type
        if notification_type == "due_soon":
            if minutes_until_due is not None:
                if minutes_until_due <= 0:
                    title = "Task Due Now!"
                    message = f"Task '{task_title}' is due now!"
                elif minutes_until_due == 1:
                    title = "Task Due Soon"
                    message = f"Task '{task_title}' is due in 1 minute!"
                else:
                    title = "Task Due Soon"
                    message = f"Task '{task_title}' is due in {minutes_until_due} minutes!"
            else:
                title = "Task Reminder"
                message = f"Don't forget about '{task_title}'"
        elif notification_type == "completed":
            title = "Task Completed"
            message = f"Great job! You completed '{task_title}'"
        elif notification_type == "created":
            title = "New Task Created"
            message = f"Task '{task_title}' has been added"
        else:
            title = "Task Update"
            message = f"Task '{task_title}' has been updated"
        
        # Send to all subscriptions
        success_count = 0
        for subscription in subscriptions:
            if self.send_push_notification(
                subscription_info=subscription,
                title=title,
                message=message
            ):
                success_count += 1
        
        return success_count


# Singleton instance
_push_service: Optional[PushNotificationService] = None


def get_push_service() -> PushNotificationService:
    """Get or create push notification service instance."""
    global _push_service
    if _push_service is None:
        _push_service = PushNotificationService()
    return _push_service


import time

