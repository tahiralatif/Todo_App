from datetime import datetime
from typing import List

from pydantic import BaseModel


# Notification type constants
NOTIFICATION_TYPES = {
    "TASK_CREATED",
    "TASK_UPDATED",
    "TASK_DELETED",
    "TASK_COMPLETED",
    "TASK_PENDING",
    "TASK_DUE_SOON",  # New type for due date reminders
    "LOGIN",
    "LOGOUT",
    "PROFILE_UPDATED",
    "SIGNUP",
}


class NotificationResponse(BaseModel):
    id: int
    user_id: str
    type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationCreateRequest(BaseModel):
    type: str
    title: str
    message: str


class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    total: int


class NotificationUpdateRequest(BaseModel):
    is_read: bool


class MarkAllAsReadResponse(BaseModel):
    message: str
    count: int
