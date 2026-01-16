"""Authentication service for JWT verification and user management."""

from typing import Any
import bcrypt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.middleware.auth import _verify_hs256
from src.models.user import User


def hash_password(plain_password: str) -> str:
    """Hash a plain password using bcrypt."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(plain_password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hashed version."""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


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
    payload: dict[str, Any] = _verify_hs256(token)
    return payload["sub"]


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
