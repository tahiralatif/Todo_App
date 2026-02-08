"""Authentication service for JWT verification and user management."""

from typing import Any
from datetime import datetime, timedelta, timezone
import bcrypt
import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.config import settings
from src.models.user import User


def hash_password(plain_password: str) -> str:
    """Hash a plain password using bcrypt."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(plain_password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hashed version."""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))



def create_access_token(user_id: str) -> str:
    """
    Create a new JWT access token.

    Args:
        user_id: The user ID to encode in the sub claim.

    Returns:
        Encoded JWT string.
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=60 * 24)  # 24 hours
    to_encode = {
        "sub": user_id,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.better_auth_secret, algorithm="HS256"
    )
    return encoded_jwt


def verify_jwt_token(token: str) -> str:
    """
    Verify JWT token and extract user_id from sub claim.

    Args:
        token: JWT token string

    Returns:
        user_id string from token's sub claim

    Raises:
        HTTPException: If token is invalid, expired, or missing sub claim
    """
    try:
        payload = jwt.decode(
            token,
            settings.better_auth_secret,
            algorithms=["HS256"],
            options={"verify_exp": True},
        )
    except jwt.InvalidTokenError:
        from fastapi import HTTPException, status  # Import inside to avoid circular deps if any

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="INVALID_TOKEN",
        )

    sub = payload.get("sub")
    if not isinstance(sub, str) or not sub:
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="INVALID_TOKEN",
        )

    return sub


async def get_or_create_user(
    session: AsyncSession,
    user_id: str,
    email: str,
) -> User:
    """
    Get existing user or create new one (lazy creation pattern).

    This implements the lazy user creation pattern where User records
    are created on-demand when a JWT sub claim is first used.

    Args:
        session: Async database session
        user_id: User UUID from JWT sub claim
        email: User email address

    Returns:
        User instance (existing or newly created)
    """
    statement = select(User).where(User.id == user_id)
    result = await session.execute(statement)
    user = result.scalar_one_or_none()

    if user is None:
        # When creating a user via JWT, we may not have a password initially
        # In a real Better Auth integration, the user record might be created with minimal data
        user = User(id=user_id, email=email, hashed_password="")
        session.add(user)
        await session.commit()
        await session.refresh(user)

    return user
