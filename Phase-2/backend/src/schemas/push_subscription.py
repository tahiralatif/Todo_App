"""Push subscription schemas for browser push notifications."""

from pydantic import BaseModel, Field
from typing import Optional


class PushSubscriptionKeys(BaseModel):
    """Push subscription keys."""
    p256dh: str = Field(..., description="P256DH key for encryption")
    auth: str = Field(..., description="Auth secret for encryption")


class PushSubscriptionCreate(BaseModel):
    """Schema for creating a push subscription."""
    endpoint: str = Field(..., description="Push notification endpoint URL")
    keys: PushSubscriptionKeys = Field(..., description="Encryption keys")


class PushSubscriptionResponse(BaseModel):
    """Schema for push subscription response."""
    id: int
    user_id: str
    endpoint: str
    p256dh: str
    auth: str
    created_at: str
    
    class Config:
        from_attributes = True


class PushTestRequest(BaseModel):
    """Schema for testing push notifications."""
    title: str = Field(default="Test Notification", description="Notification title")
    message: str = Field(default="This is a test notification", description="Notification message")

