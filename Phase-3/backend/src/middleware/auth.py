from __future__ import annotations

import jwt
from dataclasses import dataclass
from typing import Any

from fastapi import Header, HTTPException, status

from fastapi import Header, HTTPException, status

from src.config import settings


@dataclass(frozen=True)
class AuthenticatedUser:
    user_id: str


def verify_jwt_token(token: str) -> AuthenticatedUser:
    """
    Verify JWT token and extract user_id from sub claim.

    Args:
        token: JWT token string

    Returns:
        AuthenticatedUser with user_id from token's sub claim

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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="INVALID_TOKEN",
        )

    # Additional validation of sub claim
    sub = payload.get("sub")
    if not isinstance(sub, str) or not sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="INVALID_TOKEN",
        )

    return AuthenticatedUser(user_id=sub)


def extract_bearer_token(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="AUTH_REQUIRED",
        )
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="INVALID_TOKEN",
        )
    token = authorization[len("Bearer ") :].strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="INVALID_TOKEN",
        )
    return token


async def require_user(
    authorization: str | None = Header(default=None, alias="Authorization"),
) -> AuthenticatedUser:
    token = extract_bearer_token(authorization)
    return verify_jwt_token(token)
