"""Authentication routes for signup and signin endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db import get_session
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
from src.services.auth_service import hash_password, verify_password
import uuid


router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post(
    "/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED
)
async def signup(
    request: SignupRequest,
    session: AsyncSession = Depends(get_session),
) -> SignupResponse:
    """
    Register a new user.

    Per spec: backend delegates credential validation to Better Auth.
    This endpoint handles user creation or returns 409 if email exists.
    """
    # Check if user already exists
    existing = await session.execute(select(User).where(User.email == request.email))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=CONFLICT,
        )

    # Hash the password before storing
    hashed_password = hash_password(request.password)

    # Create user with a proper UUID
    user_id = str(uuid.uuid4())
    user = User(id=user_id, email=request.email, hashed_password=hashed_password)
    session.add(user)
    await session.commit()
    await session.refresh(user)

    return SignupResponse(
        id=user.id,
        email=user.email,
        created_at=user.created_at,
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
    # Verify user exists
    result = await session.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if user is None or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=INVALID_TOKEN,
        )

    # In a production setup with Better Auth, this would call Better Auth API
    # to generate a JWT. For now, we'll return a placeholder token.
    # In a real production system, you'd integrate with Better Auth properly.
    token = "placeholder_jwt_token_for_integration"  # This would come from Better Auth in production

    return SigninResponse(
        token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            created_at=user.created_at,
        ),
    )
