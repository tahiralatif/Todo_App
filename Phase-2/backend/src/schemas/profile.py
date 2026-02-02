from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class UserProfileResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    profile_photo_url: Optional[str] = None
    bio: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None
    gender: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None
    gender: Optional[str] = None

    class Config:
        from_attributes = True


class ProfileUpdateResponse(BaseModel):
    message: str
    updated_fields: list[str]
    profile: UserProfileResponse


class ImageUploadResponse(BaseModel):
    message: str
    status: str
    profile_photo_url: str
    timestamp: datetime


class ImageDeleteResponse(BaseModel):
    message: str
    timestamp: datetime