"""Pydantic schemas for authentication endpoints."""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    """Request body for user registration."""

    email: EmailStr = Field(..., description="User email address")
    password: str = Field(
        ..., min_length=8, description="User password (min 8 characters)"
    )


class SigninRequest(BaseModel):
    """Request body for user authentication."""

    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")


class UserResponse(BaseModel):
    """Response model for user data (excluding sensitive fields)."""

    id: str = Field(..., description="User UUID from Better Auth sub claim")
    email: str = Field(..., description="User email address")
    created_at: datetime = Field(..., description="Account creation timestamp")

    class Config:
        from_attributes = True
        exclude = {"hashed_password"}


class SigninResponse(BaseModel):
    """Response body for successful authentication."""

    token: str = Field(..., description="JWT token for API authentication")
    user: UserResponse = Field(..., description="Authenticated user information")


class SignupResponse(BaseModel):
    """Response body for successful user registration."""

    id: str = Field(..., description="Created user UUID")
    email: str = Field(..., description="Created user email")
    created_at: datetime = Field(..., description="Account creation timestamp")

    class Config:
        from_attributes = True
