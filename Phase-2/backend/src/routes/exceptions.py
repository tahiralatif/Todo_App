"""Custom exceptions and error handlers for authentication system."""

from datetime import datetime
from typing import Optional

from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse


class AuthenticationError(HTTPException):
    """Base exception for authentication errors."""

    def __init__(
        self,
        detail: str = "Authentication failed",
        headers: Optional[dict] = None
    ):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers=headers or {"WWW-Authenticate": "Bearer"}
        )


class InvalidCredentialsError(AuthenticationError):
    """Exception for invalid email/password combinations."""

    def __init__(self):
        super().__init__(
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )


class TokenExpiredError(AuthenticationError):
    """Exception for expired tokens."""

    def __init__(self):
        super().__init__(
            detail="Token has expired. Please login again.",
            headers={"WWW-Authenticate": "Bearer"}
        )


class InvalidTokenError(AuthenticationError):
    """Exception for invalid or malformed tokens."""

    def __init__(self):
        super().__init__(
            detail="Invalid or malformed token",
            headers={"WWW-Authenticate": "Bearer"}
        )


class UserAlreadyExistsError(HTTPException):
    """Exception for duplicate user registration attempts."""

    def __init__(self, email: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User with email '{email}' already exists"
        )


class UserNotFoundError(HTTPException):
    """Exception when user is not found."""

    def __init__(self, identifier: str = "User"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{identifier} not found"
        )


class EmailNotVerifiedError(HTTPException):
    """Exception when email verification is required."""

    def __init__(self):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email address not verified. Please check your inbox."
        )


class RateLimitExceededError(HTTPException):
    """Exception for rate limit violations."""

    def __init__(self, retry_after: int = 900):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later.",
            headers={"Retry-After": str(retry_after)}
        )


class InvalidResetTokenError(HTTPException):
    """Exception for invalid or expired password reset tokens."""

    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token"
        )


class InvalidVerificationTokenError(HTTPException):
    """Exception for invalid or expired email verification tokens."""

    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired email verification token"
        )


class WeakPasswordError(HTTPException):
    """Exception for passwords that don't meet security requirements."""

    def __init__(self, requirements: list[str]):
        detail = "Password does not meet security requirements: " + ", ".join(requirements)
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )


class AccountLockedError(HTTPException):
    """Exception when account is locked due to suspicious activity."""

    def __init__(self, unlock_time: Optional[datetime] = None):
        detail = "Account temporarily locked due to multiple failed login attempts."
        if unlock_time:
            detail += f" Try again after {unlock_time.isoformat()}"
        
        super().__init__(
            status_code=status.HTTP_423_LOCKED,
            detail=detail
        )


class DatabaseError(HTTPException):
    """Exception for database operation failures."""

    def __init__(self, operation: str = "database operation"):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete {operation}. Please try again later."
        )


class ValidationError(HTTPException):
    """Exception for validation failures."""

    def __init__(self, field: str, message: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "field": field,
                "message": message
            }
        )


# Exception Handlers for FastAPI

async def authentication_exception_handler(
    request: Request,
    exc: AuthenticationError
) -> JSONResponse:
    """Handle authentication exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "authentication_failed",
            "message": exc.detail,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url.path)
        },
        headers=exc.headers
    )


async def rate_limit_exception_handler(
    request: Request,
    exc: RateLimitExceededError
) -> JSONResponse:
    """Handle rate limit exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "rate_limit_exceeded",
            "message": exc.detail,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url.path)
        },
        headers=exc.headers
    )


async def validation_exception_handler(
    request: Request,
    exc: ValidationError
) -> JSONResponse:
    """Handle validation exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "validation_error",
            "message": "Request validation failed",
            "detail": exc.detail,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url.path)
        }
    )


async def generic_exception_handler(
    request: Request,
    exc: HTTPException
) -> JSONResponse:
    """Handle generic HTTP exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "http_error",
            "message": exc.detail,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url.path)
        }
    )


async def unhandled_exception_handler(
    request: Request,
    exc: Exception
) -> JSONResponse:
    """Handle unhandled exceptions."""
    # Log the exception here (use proper logging in production)
    print(f"Unhandled exception: {exc}")
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "internal_server_error",
            "message": "An unexpected error occurred. Please try again later.",
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url.path)
        }
    )


def register_exception_handlers(app):
    """
    Register all exception handlers with FastAPI app.
    
    Args:
        app: FastAPI application instance
    """
    from fastapi.exceptions import RequestValidationError
    
    app.add_exception_handler(AuthenticationError, authentication_exception_handler)
    app.add_exception_handler(RateLimitExceededError, rate_limit_exception_handler)
    app.add_exception_handler(ValidationError, validation_exception_handler)
    app.add_exception_handler(HTTPException, generic_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
    
    # Handle Pydantic validation errors
    @app.exception_handler(RequestValidationError)
    async def pydantic_validation_exception_handler(
        request: Request,
        exc: RequestValidationError
    ):
        """Handle Pydantic validation errors with detailed messages."""
        errors = []
        for error in exc.errors():
            errors.append({
                "field": ".".join(str(loc) for loc in error["loc"][1:]),  # Skip 'body'
                "message": error["msg"],
                "type": error["type"]
            })
        
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": "validation_error",
                "message": "Request validation failed",
                "detail": errors,
                "timestamp": datetime.utcnow().isoformat(),
                "path": str(request.url.path)
            }
        )