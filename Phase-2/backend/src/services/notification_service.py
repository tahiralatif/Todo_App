"""Notification service for managing user notifications."""

from datetime import datetime
from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.notification import Notification, NotificationType
from src.models.user import User
from src.models.task import Task


class NotificationService:
    @staticmethod
    async def create_notification(
        session: AsyncSession,
        user_id: str,
        notification_type: NotificationType,
        title: str,
        message: str,
        task: Task | None = None,
    ) -> Notification:
        """
        Create a new notification for a user.

        Args:
            session: Async database session
            user_id: Target user's UUID
            notification_type: Type of notification
            title: Notification title
            message: Notification message
            task: Associated task (optional)

        Returns:
            Created Notification instance
        """
        notification = Notification(
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            task_id=task.id if task else None,
        )
        session.add(notification)
        await session.commit()
        await session.refresh(notification)
        return notification

    @staticmethod
    async def create_task_notification(
        session: AsyncSession,
        user_id: str,
        task: Task,
        notification_type: NotificationType,
    ) -> Notification:
        """
        Create a task-related notification.

        Args:
            session: Async database session
            user_id: Target user's UUID
            task: Associated task
            notification_type: Type of task notification

        Returns:
            Created Notification instance
        """
        type_messages = {
            NotificationType.TASK_CREATED: f"New task '{task.title}' created",
            NotificationType.TASK_UPDATED: f"Task '{task.title}' updated",
            NotificationType.TASK_DELETED: f"Task '{task.title}' deleted",
            NotificationType.TASK_COMPLETED: f"Task '{task.title}' marked as completed",
            NotificationType.TASK_PENDING: f"Task '{task.title}' marked as pending",
        }

        title_map = {
            NotificationType.TASK_CREATED: "Task Created",
            NotificationType.TASK_UPDATED: "Task Updated",
            NotificationType.TASK_DELETED: "Task Deleted",
            NotificationType.TASK_COMPLETED: "Task Completed",
            NotificationType.TASK_PENDING: "Task Pending",
        }

        return await NotificationService.create_notification(
            session=session,
            user_id=user_id,
            notification_type=notification_type,
            title=title_map[notification_type],
            message=type_messages[notification_type],
            task=task,
        )

    @staticmethod
    async def create_login_notification(
        session: AsyncSession,
        user_id: str,
        user_name: str,
    ) -> Notification:
        """
        Create a login notification.

        Args:
            session: Async database session
            user_id: Target user's UUID
            user_name: User's name

        Returns:
            Created Notification instance
        """
        return await NotificationService.create_notification(
            session=session,
            user_id=user_id,
            notification_type=NotificationType.LOGIN,
            title="Login Successful",
            message=f"Welcome back, {user_name}!",
        )

    @staticmethod
    async def create_logout_notification(
        session: AsyncSession,
        user_id: str,
        user_name: str,
    ) -> Notification:
        """
        Create a logout notification.

        Args:
            session: Async database session
            user_id: Target user's UUID
            user_name: User's name

        Returns:
            Created Notification instance
        """
        return await NotificationService.create_notification(
            session=session,
            user_id=user_id,
            notification_type=NotificationType.LOGOUT,
            title="Logout Successful",
            message=f"You have been logged out, {user_name}.",
        )

    @staticmethod
    async def create_profile_update_notification(
        session: AsyncSession,
        user_id: str,
        user_name: str,
        updated_fields: List[str],
    ) -> Notification:
        """
        Create a profile update notification.

        Args:
            session: Async database session
            user_id: Target user's UUID
            user_name: User's name
            updated_fields: List of fields that were updated

        Returns:
            Created Notification instance
        """
        fields_str = ", ".join(updated_fields)
        return await NotificationService.create_notification(
            session=session,
            user_id=user_id,
            notification_type=NotificationType.PROFILE_UPDATED,
            title="Profile Updated",
            message=f"Your profile has been updated: {fields_str}",
        )

    @staticmethod
    async def create_signup_notification(
        session: AsyncSession,
        user_id: str,
        user_name: str,
    ) -> Notification:
        """
        Create a signup notification.

        Args:
            session: Async database session
            user_id: Target user's UUID
            user_name: User's name

        Returns:
            Created Notification instance
        """
        return await NotificationService.create_notification(
            session=session,
            user_id=user_id,
            notification_type=NotificationType.SIGNUP,
            title="Account Created",
            message=f"Welcome to the app, {user_name}! Your account has been created.",
        )

    @staticmethod
    async def get_user_notifications(
        session: AsyncSession,
        user_id: str,
        limit: int = 50,
        offset: int = 0,
        unread_only: bool = False,
    ) -> List[Notification]:
        """
        Get notifications for a specific user.

        Args:
            session: Async database session
            user_id: Target user's UUID
            limit: Maximum number of notifications to return
            offset: Number of notifications to skip
            unread_only: Whether to return only unread notifications

        Returns:
            List of Notification instances
        """
        query = select(Notification).where(Notification.user_id == user_id)

        if unread_only:
            query = query.where(Notification.is_read == False)

        query = query.order_by(Notification.created_at.desc()).offset(offset).limit(limit)

        result = await session.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def mark_notification_as_read(
        session: AsyncSession,
        notification_id: int,
        user_id: str,
    ) -> bool:
        """
        Mark a specific notification as read.

        Args:
            session: Async database session
            notification_id: ID of the notification to mark as read
            user_id: Target user's UUID (for security check)

        Returns:
            True if successfully marked as read, False if not found
        """
        notification = await session.get(Notification, notification_id)
        if notification and notification.user_id == user_id:
            notification.is_read = True
            await session.commit()
            return True
        return False

    @staticmethod
    async def mark_all_notifications_as_read(
        session: AsyncSession,
        user_id: str,
    ) -> int:
        """
        Mark all notifications for a user as read.

        Args:
            session: Async database session
            user_id: Target user's UUID

        Returns:
            Number of notifications marked as read
        """
        from sqlalchemy import update

        stmt = (
            update(Notification)
            .where(Notification.user_id == user_id)
            .values(is_read=True)
        )

        result = await session.execute(stmt)
        await session.commit()
        return result.rowcount

    @staticmethod
    async def delete_notification(
        session: AsyncSession,
        notification_id: int,
        user_id: str,
    ) -> bool:
        """
        Delete a specific notification.

        Args:
            session: Async database session
            notification_id: ID of the notification to delete
            user_id: Target user's UUID (for security check)

        Returns:
            True if successfully deleted, False if not found
        """
        notification = await session.get(Notification, notification_id)
        if notification and notification.user_id == user_id:
            await session.delete(notification)
            await session.commit()
            return True
        return False