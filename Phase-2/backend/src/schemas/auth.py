"""Production-ready Pydantic schemas for authentication endpoints."""

import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict


class SignupRequest(BaseModel):
    """Request body for user registration with enhanced validation."""

    name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="User full name",
        examples=["Ahmed Khan"]
    )
    email: EmailStr = Field(
        ...,
        description="User email address",
        examples=["ahmed@example.com"]
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="User password (min 8 characters, must include uppercase, lowercase, number, and special character)",
        examples=["SecurePass123!"]
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Validate and sanitize user name."""
        # Remove leading/trailing whitespace
        v = v.strip()
        
        # Check for only whitespace
        if not v or v.isspace():
            raise ValueError("Name cannot be empty or contain only whitespace")
        
        # Remove excessive spaces
        v = re.sub(r'\s+', ' ', v)
        
        # Check for valid characters (letters, spaces, hyphens, apostrophes)
        if not re.match(r"^[a-zA-Z\s\-'\.]+$", v):
            raise ValueError(
                "Name can only contain letters, spaces, hyphens, apostrophes, and periods"
            )
        
        return v

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Validate password strength with comprehensive requirements."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        
        if len(v) > 128:
            raise ValueError("Password must not exceed 128 characters")
        
        # Check for uppercase letter
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        
        # Check for lowercase letter
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        
        # Check for digit
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        
        # Check for special character
        if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>/?]", v):
            raise ValueError("Password must contain at least one special character")
        
        # Check for common weak passwords
        common_passwords = [
            "password", "12345678", "password123", "qwerty123",
            "admin123", "welcome123", "letmein123"
        ]
        if v.lower() in common_passwords:
            raise ValueError("Password is too common. Please choose a stronger password")
        
        return v

    model_config = ConfigDict(
        str_strip_whitespace=True,
        json_schema_extra={
            "example": {
                "name": "Ahmed Khan",
                "email": "ahmed@example.com",
                "password": "SecurePass123!"
            }
        }
    )


class SigninRequest(BaseModel):
    """Request body for user authentication with rate limiting support."""

    email: EmailStr = Field(
        ...,
        description="User email address",
        examples=["ahmed@example.com"]
    )
    password: str = Field(
        ...,
        min_length=1,
        max_length=128,
        description="User password",
        examples=["SecurePass123!"]
    )

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        """Normalize email to lowercase."""
        return v.lower().strip()

    model_config = ConfigDict(
        str_strip_whitespace=True,
        json_schema_extra={
            "example": {
                "email": "ahmed@example.com",
                "password": "SecurePass123!"
            }
        }
    )


class UserResponse(BaseModel):
    """Response model for user data (excluding sensitive fields)."""

    id: str = Field(
        ...,
        description="User UUID from Better Auth sub claim",
        examples=["550e8400-e29b-41d4-a716-446655440000"]
    )
    name: str = Field(
        ...,
        description="User full name",
        examples=["Ahmed Khan"]
    )
    email: str = Field(
        ...,
        description="User email address",
        examples=["ahmed@example.com"]
    )
    profile_photo_url: Optional[str] = Field(
        None,
        description="User profile photo URL",
        examples=["https://example.com/photos/user123.jpg"]
    )
    created_at: datetime = Field(
        ...,
        description="Account creation timestamp (ISO 8601 format)",
        examples=["2024-01-15T10:30:00Z"]
    )
    updated_at: Optional[datetime] = Field(
        None,
        description="Last profile update timestamp (ISO 8601 format)",
        examples=["2024-02-10T14:20:00Z"]
    )
    is_email_verified: bool = Field(
        default=False,
        description="Email verification status"
    )

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "name": "Ahmed Khan",
                "email": "ahmed@example.com",
                "profile_photo_url": "https://example.com/photos/user123.jpg",
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-02-10T14:20:00Z",
                "is_email_verified": True
            }
        }
    )


class SigninResponse(BaseModel):
    """Response body for successful authentication with token metadata."""

    token: str = Field(
        ...,
        description="JWT token for API authentication (Bearer token)",
        examples=["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."]
    )
    user: UserResponse = Field(
        ...,
        description="Authenticated user information"
    )
    token_type: str = Field(
        default="Bearer",
        description="Token type for Authorization header"
    )
    expires_in: int = Field(
        default=3600,
        description="Token expiration time in seconds",
        examples=[3600]
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "Bearer",
                "expires_in": 3600,
                "user": {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "name": "Ahmed Khan",
                    "email": "ahmed@example.com",
                    "profile_photo_url": None,
                    "created_at": "2024-01-15T10:30:00Z",
                    "is_email_verified": True
                }
            }
        }
    )


class SignupResponse(BaseModel):
    """Response body for successful user registration."""

    id: str = Field(
        ...,
        description="Created user UUID",
        examples=["550e8400-e29b-41d4-a716-446655440000"]
    )
    email: str = Field(
        ...,
        description="Created user email",
        examples=["ahmed@example.com"]
    )
    name: str = Field(
        ...,
        description="Created user name",
        examples=["Ahmed Khan"]
    )
    created_at: datetime = Field(
        ...,
        description="Account creation timestamp (ISO 8601 format)",
        examples=["2024-01-15T10:30:00Z"]
    )
    message: str = Field(
        default="Account created successfully. Please verify your email.",
        description="Success message"
    )

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "ahmed@example.com",
                "name": "Ahmed Khan",
                "created_at": "2024-01-15T10:30:00Z",
                "message": "Account created successfully. Please verify your email."
            }
        }
    )


class ErrorResponse(BaseModel):
    """Standard error response format."""

    error: str = Field(
        ...,
        description="Error type or category",
        examples=["validation_error", "authentication_failed", "resource_not_found"]
    )
    message: str = Field(
        ...,
        description="Human-readable error message",
        examples=["Invalid email or password"]
    )
    detail: Optional[dict] = Field(
        None,
        description="Additional error details (e.g., field validation errors)",
        examples=[{"field": "password", "issue": "Password too weak"}]
    )
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Error timestamp (ISO 8601 format)"
    )
    request_id: Optional[str] = Field(
        None,
        description="Request ID for tracking",
        examples=["req_abc123xyz"]
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "error": "validation_error",
                "message": "Password does not meet security requirements",
                "detail": {
                    "field": "password",
                    "requirements": [
                        "At least 8 characters",
                        "One uppercase letter",
                        "One lowercase letter",
                        "One number",
                        "One special character"
                    ]
                },
                "timestamp": "2024-02-13T10:30:00Z",
                "request_id": "req_abc123xyz"
            }
        }
    )


class RefreshTokenRequest(BaseModel):
    """Request body for token refresh."""

    refresh_token: str = Field(
        ...,
        description="Valid refresh token",
        examples=["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."]
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
        }
    )


class TokenResponse(BaseModel):
    """Response body for token operations."""

    access_token: str = Field(
        ...,
        description="New JWT access token",
        examples=["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."]
    )
    token_type: str = Field(
        default="Bearer",
        description="Token type"
    )
    expires_in: int = Field(
        ...,
        description="Token expiration time in seconds",
        examples=[3600]
    )
    refresh_token: Optional[str] = Field(
        None,
        description="New refresh token (if rotation enabled)",
        examples=["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."]
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "Bearer",
                "expires_in": 3600,
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
        }
    )


class PasswordResetRequest(BaseModel):
    """Request body for password reset initiation."""

    email: EmailStr = Field(
        ...,
        description="User email address for password reset",
        examples=["ahmed@example.com"]
    )

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        """Normalize email to lowercase."""
        return v.lower().strip()

    model_config = ConfigDict(
        str_strip_whitespace=True,
        json_schema_extra={
            "example": {
                "email": "ahmed@example.com"
            }
        }
    )


class PasswordResetConfirm(BaseModel):
    """Request body for password reset confirmation."""

    token: str = Field(
        ...,
        description="Password reset token from email",
        examples=["abc123def456"]
    )
    new_password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="New password",
        examples=["NewSecurePass123!"]
    )

    @field_validator("new_password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Reuse password validation from SignupRequest."""
        return SignupRequest.validate_password_strength(v)

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "token": "abc123def456",
                "new_password": "NewSecurePass123!"
            }
        }
    )


class EmailVerificationRequest(BaseModel):
    """Request body for email verification."""

    token: str = Field(
        ...,
        description="Email verification token",
        examples=["verify_abc123"]
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "token": "verify_abc123"
            }
        }
    )


class SuccessResponse(BaseModel):
    """Generic success response."""

    success: bool = Field(default=True, description="Operation success status")
    message: str = Field(..., description="Success message")
    data: Optional[dict] = Field(None, description="Additional response data")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "success": True,
                "message": "Password reset email sent successfully",
                "data": None
            }
        }
    )