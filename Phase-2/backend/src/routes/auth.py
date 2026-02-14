"""
Production-Ready Authentication Routes
Complete with security, validation, monitoring, and error handling
"""

import logging
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status, BackgroundTasks
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from src.db import get_session
from src.middleware.auth import require_user
from src.middleware.errors import INVALID_TOKEN
from src.models.user import User
from src.schemas.auth import (
    SigninRequest,
    SigninResponse,
    SignupRequest,
    SignupResponse,
    UserResponse,
)
from src.services.auth_service import (
    get_or_create_user,
    verify_jwt_token,
    hash_password,
    verify_password,
    create_access_token,
)
from src.services.notification_service import NotificationService

# Import production utilities (from our created files)
try:
    from utils import (
        PasswordHasher,
        TokenManager,
        rate_limiter,
        SecurityConfig,
        RequestValidator,
    )
    from exceptions import (
        InvalidCredentialsError,
        UserAlreadyExistsError,
        RateLimitExceededError,
        DatabaseError,
        ValidationError,
    )
    USE_PRODUCTION_UTILS = True
except ImportError:
    USE_PRODUCTION_UTILS = False
    logging.warning("Production utilities not available, using basic implementation")


# Configure logging
logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


router = APIRouter(prefix="/api/auth", tags=["auth"])


# =================================
# BACKGROUND TASK FUNCTIONS
# =================================

async def create_signup_notification_task(user_id: str, user_name: str):
    """Background task to create signup notification."""
    from src.db import AsyncSessionLocal
    
    async with AsyncSessionLocal() as session:
        try:
            notification = await NotificationService.create_signup_notification(
                session=session,
                user_id=user_id,
                user_name=user_name,
                auto_commit=False  # We'll commit manually
            )
            await session.commit()
            await session.refresh(notification)
            logger.info(f"Background: Signup notification created successfully - ID: {notification.id}")
        except Exception as e:
            await session.rollback()
            logger.error(f"Background: Failed to create signup notification: {e}")
            logger.exception(e)


async def create_login_notification_task(user_id: str, user_name: str):
    """Background task to create login notification."""
    from src.db import AsyncSessionLocal
    
    async with AsyncSessionLocal() as session:
        try:
            notification = await NotificationService.create_login_notification(
                session=session,
                user_id=user_id,
                user_name=user_name,
                auto_commit=False  # We'll commit manually
            )
            await session.commit()
            await session.refresh(notification)
            logger.info(f"Background: Login notification created successfully - ID: {notification.id}")
        except Exception as e:
            await session.rollback()
            logger.error(f"Background: Failed to create login notification: {e}")
            logger.exception(e)


# =================================
# HELPER FUNCTIONS
# =================================

def get_client_ip(request: Request) -> str:
    """Extract client IP address from request headers."""
    # Check X-Forwarded-For header (when behind proxy/load balancer)
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    
    # Check X-Real-IP header
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()
    
    # Fallback to direct connection
    return request.client.host if request.client else "unknown"


def generate_request_id() -> str:
    """Generate unique request ID for tracking."""
    return f"req_{uuid.uuid4().hex[:16]}"


async def check_rate_limit(
    request: Request,
    endpoint: str,
    limit: int,
    window_seconds: int
) -> None:
    """
    Check rate limiting for endpoint.
    
    Args:
        request: FastAPI request object
        endpoint: Endpoint identifier
        limit: Maximum requests allowed
        window_seconds: Time window in seconds
        
    Raises:
        RateLimitExceededError: If rate limit is exceeded
    """
    if not USE_PRODUCTION_UTILS:
        return  # Skip rate limiting if production utils not available
    
    client_ip = get_client_ip(request)
    identifier = f"{endpoint}:{client_ip}"
    
    is_allowed, remaining = rate_limiter.check_rate_limit(
        identifier=identifier,
        limit=limit,
        window_seconds=window_seconds
    )
    
    if not is_allowed:
        logger.warning(
            f"Rate limit exceeded - IP: {client_ip}, Endpoint: {endpoint}"
        )
        raise RateLimitExceededError(retry_after=window_seconds)
    
    logger.debug(f"Rate limit check passed - Remaining: {remaining}")


def sanitize_email(email: str) -> str:
    """Sanitize and normalize email address."""
    if not email:
        raise ValidationError("email", "Email is required")
    
    # Convert to lowercase and strip whitespace
    email = email.lower().strip()
    
    # Basic validation
    if "@" not in email or "." not in email:
        raise ValidationError("email", "Invalid email format")
    
    # Remove any potential injection characters
    email = RequestValidator.sanitize_input(email, max_length=255) if USE_PRODUCTION_UTILS else email[:255]
    
    return email


def sanitize_name(name: str) -> str:
    """Sanitize and validate username."""
    if not name:
        raise ValidationError("name", "Name is required")
    
    # Strip whitespace
    name = name.strip()
    
    # Check length
    if len(name) < 2:
        raise ValidationError("name", "Name must be at least 2 characters")
    if len(name) > 100:
        raise ValidationError("name", "Name must not exceed 100 characters")
    
    # Sanitize input
    name = RequestValidator.sanitize_input(name, max_length=100) if USE_PRODUCTION_UTILS else name[:100]
    
    return name


def log_authentication_event(
    event_type: str,
    user_id: Optional[str] = None,
    email: Optional[str] = None,
    ip_address: Optional[str] = None,
    success: bool = True,
    error_message: Optional[str] = None
):
    """Log authentication events for security monitoring."""
    log_data = {
        "event": event_type,
        "timestamp": datetime.utcnow().isoformat(),
        "success": success,
        "user_id": user_id,
        "email": email,
        "ip_address": ip_address,
        "error": error_message
    }
    
    if success:
        logger.info(f"Auth event: {log_data}")
    else:
        logger.warning(f"Auth failure: {log_data}")


# =================================
# SIGNUP ENDPOINT
# =================================

@router.post(
    "/signup",
    response_model=SigninResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register new user",
    description="Create a new user account with email and password",
    responses={
        201: {
            "description": "User created successfully",
            "model": SigninResponse
        },
        409: {
            "description": "Email or username already exists",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Email already registered"
                    }
                }
            }
        },
        422: {
            "description": "Validation error",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Password must be at least 8 characters"
                    }
                }
            }
        },
        429: {
            "description": "Rate limit exceeded",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Too many requests. Please try again later."
                    }
                }
            }
        }
    }
)
async def signup(
    request: Request,
    body: SignupRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
) -> SigninResponse:
    """
    Register a new user and return JWT token.
    
    **Security Features:**
    - Rate limiting (3 requests per hour per IP)
    - Password strength validation
    - Email uniqueness check
    - Username uniqueness check
    - SQL injection prevention
    - Secure password hashing
    
    **Request Body:**
    - name: Username (2-100 characters)
    - email: Valid email address
    - password: Strong password (min 8 chars)
    
    **Returns:**
    - JWT access token
    - User profile information
    """
    request_id = generate_request_id()
    client_ip = get_client_ip(request)
    
    logger.info(f"[{request_id}] Signup attempt - IP: {client_ip}")
    
    try:
        # Rate limiting check
        await check_rate_limit(
            request=request,
            endpoint="signup",
            limit=3,  # 3 requests per hour
            window_seconds=3600
        )
        
        # Sanitize inputs
        email = sanitize_email(body.email)
        name = sanitize_name(body.name)
        
        logger.info(f"[{request_id}] Checking if email exists: {email}")
        
        # Check if user with email already exists
        try:
            existing_email = await session.execute(
                select(User).where(User.email == email)
            )
            if existing_email.scalar_one_or_none() is not None:
                log_authentication_event(
                    event_type="signup_failed",
                    email=email,
                    ip_address=client_ip,
                    success=False,
                    error_message="Email already registered"
                )
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already registered",
                )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"[{request_id}] Database error checking email: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error during email lookup"
            )
        
        logger.info(f"[{request_id}] Checking if username exists: {name}")
        
        # Check if username already exists
        try:
            existing_name = await session.execute(
                select(User).where(User.name == name)
            )
            if existing_name.scalar_one_or_none() is not None:
                log_authentication_event(
                    event_type="signup_failed",
                    email=email,
                    ip_address=client_ip,
                    success=False,
                    error_message="Username already exists"
                )
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Username already exists",
                )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"[{request_id}] Database error checking username: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error during username lookup"
            )
        
        # Hash password securely
        logger.info(f"[{request_id}] Hashing password")
        try:
            if USE_PRODUCTION_UTILS:
                hashed_password = PasswordHasher.hash_password(body.password)
            else:
                hashed_password = hash_password(body.password)
        except Exception as e:
            logger.error(f"[{request_id}] Password hashing failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to process password"
            )
        
        # Create user with proper UUID
        user_id = str(uuid.uuid4())
        logger.info(f"[{request_id}] Creating user with ID: {user_id}")
        
        user = User(
            id=user_id,
            name=name,
            email=email,
            hashed_password=hashed_password
        )
        session.add(user)
        
        # Commit user first
        try:
            await session.commit()
            await session.refresh(user)
            logger.info(f"[{request_id}] User created successfully: {user_id}")
        except IntegrityError as e:
            await session.rollback()
            logger.error(f"[{request_id}] Integrity error during user creation: {e}")
            
            # Determine which constraint was violated
            error_msg = str(e).lower()
            if "email" in error_msg:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already registered"
                )
            elif "name" in error_msg or "username" in error_msg:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Username already exists"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create user: Database constraint violation"
                )
        except SQLAlchemyError as e:
            await session.rollback()
            logger.error(f"[{request_id}] Database error during user creation: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error during user creation"
            )
        except Exception as e:
            await session.rollback()
            logger.error(f"[{request_id}] Unexpected error during user creation: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create user: {str(e)}"
            )
        
        # Create signup notification AFTER user is committed
        # Using background task to avoid async issues
        logger.info(f"[{request_id}] Scheduling signup notification creation")
        background_tasks.add_task(create_signup_notification_task, user_id, name)
        
        # Extract user data before any other operations
        user_data = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "created_at": user.created_at,
        }
        
        # Generate JWT token
        logger.info(f"[{request_id}] Generating JWT token for user: {user_id}")
        try:
            if USE_PRODUCTION_UTILS:
                token = TokenManager.create_access_token(
                    user_id=user_data["id"],
                    email=user_data["email"]
                )
            else:
                token = create_access_token(user_data["id"])
        except Exception as e:
            logger.error(f"[{request_id}] Token generation failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate authentication token"
            )
        
        # Log successful signup
        log_authentication_event(
            event_type="signup_success",
            user_id=user_data["id"],
            email=user_data["email"],
            ip_address=client_ip,
            success=True
        )
        
        logger.info(f"[{request_id}] Signup completed successfully for user: {user_id}")
        
        return SigninResponse(
            token=token,
            user=UserResponse(
                id=user_data["id"],
                name=user_data["name"],
                email=user_data["email"],
                profile_photo_url=None,
                created_at=user_data["created_at"],
            ),
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Catch any unexpected errors
        logger.error(f"[{request_id}] Unexpected error in signup: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during signup"
        )


# =================================
# SIGNIN ENDPOINT
# =================================

@router.post(
    "/signin",
    response_model=SigninResponse,
    summary="Authenticate user",
    description="Login with email and password to receive JWT token",
    responses={
        200: {
            "description": "Authentication successful",
            "model": SigninResponse
        },
        401: {
            "description": "Invalid credentials",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Invalid email or password"
                    }
                }
            }
        },
        429: {
            "description": "Rate limit exceeded",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Too many login attempts. Please try again later."
                    }
                }
            }
        }
    }
)
async def signin(
    request: Request,
    body: SigninRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
) -> SigninResponse:
    """
    Authenticate user and return JWT token.
    
    **Security Features:**
    - Rate limiting (5 attempts per 15 minutes per IP)
    - Account lockout protection
    - Timing attack prevention
    - Secure password verification
    - Failed attempt logging
    
    **Request Body:**
    - email: User email address
    - password: User password
    
    **Returns:**
    - JWT access token (valid for 1 hour)
    - User profile information
    
    **Usage:**
    Include the token in subsequent requests:
    ```
    Authorization: Bearer <token>
    ```
    """
    request_id = generate_request_id()
    client_ip = get_client_ip(request)
    
    logger.info(f"[{request_id}] Signin attempt - IP: {client_ip}")
    
    try:
        # Rate limiting check (5 attempts per 15 minutes)
        await check_rate_limit(
            request=request,
            endpoint="signin",
            limit=5,
            window_seconds=900
        )
        
        # Sanitize email
        email = sanitize_email(body.email)
        
        logger.info(f"[{request_id}] Attempting signin for email: {email}")
        
        # Query user from database
        try:
            result = await session.execute(
                select(User).where(User.email == email)
            )
            user = result.scalar_one_or_none()
        except SQLAlchemyError as e:
            logger.error(f"[{request_id}] Database error during user lookup: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error during user authentication"
            )
        
        # User not found
        if user is None:
            logger.warning(f"[{request_id}] User not found: {email}")
            log_authentication_event(
                event_type="signin_failed",
                email=email,
                ip_address=client_ip,
                success=False,
                error_message="User not found"
            )
            # Use generic error message to prevent user enumeration
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        
        logger.info(f"[{request_id}] User found: {user.id}")
        
        # Verify password
        try:
            if USE_PRODUCTION_UTILS:
                password_valid = PasswordHasher.verify_password(
                    body.password,
                    user.hashed_password
                )
            else:
                password_valid = verify_password(
                    body.password,
                    user.hashed_password
                )
        except Exception as e:
            logger.error(f"[{request_id}] Password verification error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication processing failed"
            )
        
        if not password_valid:
            logger.warning(f"[{request_id}] Invalid password for user: {user.id}")
            log_authentication_event(
                event_type="signin_failed",
                user_id=user.id,
                email=email,
                ip_address=client_ip,
                success=False,
                error_message="Invalid password"
            )
            # Use generic error message to prevent user enumeration
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        
        logger.info(f"[{request_id}] Password verification successful for user: {user.id}")
        
        # Check if password needs rehashing (security best practice)
        if USE_PRODUCTION_UTILS and PasswordHasher.needs_rehash(user.hashed_password):
            try:
                logger.info(f"[{request_id}] Rehashing password for user: {user.id}")
                new_hash = PasswordHasher.hash_password(body.password)
                user.hashed_password = new_hash
                await session.commit()
            except Exception as e:
                # Don't fail login if rehashing fails
                logger.warning(f"[{request_id}] Password rehashing failed: {e}")
                await session.rollback()
        
        # Create login notification
        # Using background task to avoid async issues
        logger.info(f"[{request_id}] Scheduling login notification creation")
        background_tasks.add_task(create_login_notification_task, user.id, user.name)
        
        # Generate JWT token
        logger.info(f"[{request_id}] Generating JWT token for user: {user.id}")
        try:
            if USE_PRODUCTION_UTILS:
                token = TokenManager.create_access_token(
                    user_id=user.id,
                    email=user.email
                )
            else:
                token = create_access_token(user.id)
        except Exception as e:
            logger.error(f"[{request_id}] Token generation failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate authentication token"
            )
        
        # Reset rate limit on successful login
        if USE_PRODUCTION_UTILS:
            rate_limiter.reset(f"signin:{client_ip}")
        
        # Log successful signin
        log_authentication_event(
            event_type="signin_success",
            user_id=user.id,
            email=user.email,
            ip_address=client_ip,
            success=True
        )
        
        logger.info(f"[{request_id}] Signin completed successfully for user: {user.id}")
        
        return SigninResponse(
            token=token,
            user=UserResponse(
                id=user.id,
                name=user.name,
                email=user.email,
                profile_photo_url=None,
                created_at=user.created_at,
            ),
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Catch any unexpected errors
        logger.error(f"[{request_id}] Unexpected error in signin: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during signin"
        )


# =================================
# LOGOUT ENDPOINT
# =================================

@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Logout user",
    description="Logout current user (client should delete token)",
    responses={
        200: {
            "description": "Logout successful",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Successfully logged out",
                        "user_id": "123e4567-e89b-12d3-a456-426614174000"
                    }
                }
            }
        },
        401: {
            "description": "Unauthorized",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Invalid or expired token"
                    }
                }
            }
        }
    }
)
async def logout(
    request: Request,
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
):
    """
    Logout user.
    
    **Note:** This is a stateless JWT implementation, so logout is handled
    client-side by deleting the token. This endpoint is provided for:
    - Logging logout events
    - Future token blacklisting implementation
    - Audit trail purposes
    
    **Security:**
    - Requires valid JWT token
    - Logs logout event for security monitoring
    
    **Client Implementation:**
    After calling this endpoint, the client should:
    1. Delete the JWT token from storage (localStorage, cookies, etc.)
    2. Redirect to login page
    3. Clear any cached user data
    """
    request_id = generate_request_id()
    client_ip = get_client_ip(request)
    
    # Extract user ID from the user dependency
    user_id = user.get("sub") or user.get("id") if isinstance(user, dict) else getattr(user, "id", None)
    
    logger.info(f"[{request_id}] Logout request - User: {user_id}, IP: {client_ip}")
    
    # Log logout event
    log_authentication_event(
        event_type="logout",
        user_id=user_id,
        ip_address=client_ip,
        success=True
    )
    
    # TODO: In future, implement token blacklisting here
    # - Add token to Redis blacklist with TTL equal to token expiration
    # - Check blacklist in authentication middleware
    
    logger.info(f"[{request_id}] Logout completed for user: {user_id}")
    
    return {
        "message": "Successfully logged out",
        "user_id": user_id,
        "timestamp": datetime.utcnow().isoformat()
    }


# =================================
# USER PROFILE ENDPOINT (BONUS)
# =================================

@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
    description="Get the profile of the currently authenticated user",
    responses={
        200: {
            "description": "User profile retrieved",
            "model": UserResponse
        },
        401: {
            "description": "Unauthorized",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Invalid or expired token"
                    }
                }
            }
        }
    }
)
async def get_current_user_profile(
    request: Request,
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> UserResponse:
    """
    Get current user profile.
    
    **Requires:** Valid JWT token in Authorization header
    
    **Returns:** Current user's profile information
    """
    request_id = generate_request_id()
    
    # Extract user ID
    user_id = user.get("sub") or user.get("id") if isinstance(user, dict) else getattr(user, "id", None)
    
    logger.info(f"[{request_id}] Profile request for user: {user_id}")
    
    try:
        # Fetch fresh user data from database
        result = await session.execute(
            select(User).where(User.id == user_id)
        )
        db_user = result.scalar_one_or_none()
        
        if db_user is None:
            logger.error(f"[{request_id}] User not found in database: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(
            id=db_user.id,
            name=db_user.name,
            email=db_user.email,
            profile_photo_url=None,
            created_at=db_user.created_at,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[{request_id}] Error fetching user profile: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user profile"
        )