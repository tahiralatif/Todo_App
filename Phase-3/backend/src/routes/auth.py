"""Authentication routes for signup and signin endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db import get_session
from src.middleware.auth import require_user
from src.middleware.errors import CONFLICT, INVALID_TOKEN
from src.models.user import User
from src.schemas.auth import (
    SigninRequest,
    SigninResponse,
    SignupRequest,
    SignupResponse,
    UserResponse,
)
from src.services.auth_service import get_or_create_user, verify_jwt_token
from src.services.auth_service import hash_password, verify_password, create_access_token
from src.services.notification_service import NotificationService
from src.models.notification import NotificationType
import uuid


router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post(
    "/signup", response_model=SigninResponse, status_code=status.HTTP_201_CREATED
)
async def signup(
    request: SignupRequest,
    session: AsyncSession = Depends(get_session),
) -> SigninResponse:
    """
    Register a new user and return JWT token.

    Per spec: backend delegates credential validation to Better Auth.
    This endpoint handles user creation or returns 409 if email exists.
    Returns token immediately after successful signup.
    """
    # Check if user already exists
    existing = await session.execute(select(User).where(User.email == request.email))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=CONFLICT,
        )

    # Check if name is unique
    existing_name = await session.execute(select(User).where(User.name == request.name))
    if existing_name.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists",
        )

    # Hash the password before storing
    hashed_password = hash_password(request.password)

    # Create user with a proper UUID
    user_id = str(uuid.uuid4())
    user = User(id=user_id, name=request.name, email=request.email, hashed_password=hashed_password)
    session.add(user)
    await session.commit()
    await session.refresh(user)

    # Generate JWT token for immediate login
    token = create_access_token(user.id)

    # Create notification for signup
    await NotificationService.create_signup_notification(
        session=session,
        user_id=user.id,
        user_name=user.name,
    )

    return SigninResponse(
        token=token,
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            profile_photo_url=user.profile_photo_url,
            created_at=user.created_at,
        ),
    )


@router.post("/signin", response_model=SigninResponse)
async def signin(
    request: SigninRequest,
    session: AsyncSession = Depends(get_session),
) -> SigninResponse:
    """
    Authenticate user and return JWT token.

    Per spec: Better Auth generates JWT; backend validates credentials
    and returns token. Returns 401 if credentials are invalid.
    """
    print(f"DEBUG: Attempting signin for email: {request.email}")
    
    # Verify user exists
    result = await session.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if user is None:
        print("DEBUG: User not found in database.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=INVALID_TOKEN,
        )
    
    print(f"DEBUG: User found: {user.id}")
    
    if not verify_password(request.password, user.hashed_password):
        print("DEBUG: Password verification failed.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=INVALID_TOKEN,
        )

    print("DEBUG: Password verification successful. Generating token...")

    # Generate a real JWT token using the shared secret
    token = create_access_token(user.id)
    print(f"DEBUG: Token generated successfully.")

    # Create login notification
    try:
        await NotificationService.create_login_notification(
            session=session,
            user_id=user.id,
            user_name=user.name,
        )
    except Exception as e:
        print(f"DEBUG: Failed to create login notification: {e}")

    return SigninResponse(
        token=token,
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            profile_photo_url=user.profile_photo_url,
            created_at=user.created_at,
        ),
    )


@router.post("/logout")
async def logout(
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
):
    """
    Logout user and create a logout notification.
    """
    # Get user details
    db_user = await session.get(User, user.user_id)

    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Create logout notification
    try:
        await NotificationService.create_logout_notification(
            session=session,
            user_id=db_user.id,
            user_name=db_user.name,
        )
    except Exception as e:
        print(f"DEBUG: Failed to create logout notification: {e}")

    return {"message": "Successfully logged out"}
