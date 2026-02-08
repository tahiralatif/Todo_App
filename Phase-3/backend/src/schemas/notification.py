from __future__ import annotations

from datetime import datetime
from typing import List
from enum import Enum

from pydantic import BaseModel

from src.models.notification import NotificationType


class NotificationResponse(BaseModel):
    id: int
    user_id: str
    type: NotificationType
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationCreateRequest(BaseModel):
    type: NotificationType
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