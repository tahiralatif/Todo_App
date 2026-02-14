from datetime import datetime, date
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserProfileResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    profile_photo_url: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100, description="Display name")
    first_name: Optional[str] = Field(None, max_length=100, description="First name")
    last_name: Optional[str] = Field(None, max_length=100, description="Last name")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")
    date_of_birth: Optional[date] = Field(None, description="Date of birth (YYYY-MM-DD)")
    gender: Optional[str] = Field(None, max_length=20, description="Gender")
    address: Optional[str] = Field(None, description="Full address")
    city: Optional[str] = Field(None, max_length=100, description="City")
    country: Optional[str] = Field(None, max_length=100, description="Country")
    bio: Optional[str] = Field(None, max_length=500, description="Short bio")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "name": "Shahab Khan",
                "first_name": "Shahab",
                "last_name": "Khan",
                "phone": "+92 300 1234567",
                "date_of_birth": "2000-01-15",
                "gender": "Male",
                "address": "123 Main Street, Block A",
                "city": "Karachi",
                "country": "Pakistan",
                "bio": "Software Developer passionate about building great products"
            }
        }


class ProfileUpdateResponse(BaseModel):
    message: str
    updated_fields: list[str]
    profile: UserProfileResponse


class ImageUploadResponse(BaseModel):
    message: str
    photo_url: str  # Changed from profile_photo_url to photo_url
    uploaded_at: datetime  # Changed from timestamp to uploaded_at


class ImageDeleteResponse(BaseModel):
    message: str
    timestamp: datetime
