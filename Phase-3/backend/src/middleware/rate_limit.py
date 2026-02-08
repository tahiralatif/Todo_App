"""Rate limiting middleware for API endpoints."""

import time
from collections import defaultdict
from typing import Dict, Tuple
from fastapi import HTTPException, Request, status
from functools import wraps
import logging

logger = logging.getLogger(__name__)


class RateLimiter:
    """In-memory rate limiter using sliding window algorithm."""

    def __init__(self):
        # Store: {client_id: {endpoint: [(timestamp, count)]}}
        self.requests: Dict[str, Dict[str, list[Tuple[float, int]]]] = defaultdict(
            lambda: defaultdict(list)
        )

    def _get_client_id(self, request: Request) -> str:
        """Get client identifier from request (IP address or user_id)."""
        # Try to get user_id from request state (if authenticated)
        if hasattr(request.state, "user_id"):
            return f"user:{request.state.user_id}"
        
        # Fall back to IP address
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return f"ip:{forwarded.split(',')[0].strip()}"
        
        client_host = request.client.host if request.client else "unknown"
        return f"ip:{client_host}"

    def _clean_old_requests(
        self, requests_list: list[Tuple[float, int]], window_seconds: int
    ) -> list[Tuple[float, int]]:
        """Remove requests older than the time window."""
        current_time = time.time()
        cutoff_time = current_time - window_seconds
        return [(ts, count) for ts, count in requests_list if ts > cutoff_time]

    def check_rate_limit(
        self, request: Request, max_requests: int, window_seconds: int = 60
    ) -> bool:
        """
        Check if request is within rate limit.

        Args:
            request: FastAPI request object
            max_requests: Maximum number of requests allowed in the window
            window_seconds: Time window in seconds (default: 60)

        Returns:
            True if within limit, False if exceeded

        Raises:
            HTTPException: 429 Too Many Requests if limit exceeded
        """
        client_id = self._get_client_id(request)
        endpoint = f"{request.method}:{request.url.path}"
        current_time = time.time()

        # Clean old requests
        self.requests[client_id][endpoint] = self._clean_old_requests(
            self.requests[client_id][endpoint], window_seconds
        )

        # Count requests in current window
        request_count = sum(count for _, count in self.requests[client_id][endpoint])

        if request_count >= max_requests:
            logger.warning(
                f"Rate limit exceeded for {client_id} on {endpoint}: "
                f"{request_count}/{max_requests} requests in {window_seconds}s"
            )
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "RATE_LIMIT_EXCEEDED",
                    "message": f"Too many requests. Maximum {max_requests} requests per {window_seconds} seconds.",
                    "retry_after": window_seconds,
                },
            )

        # Add current request
        self.requests[client_id][endpoint].append((current_time, 1))
        
        logger.debug(
            f"Rate limit check passed for {client_id} on {endpoint}: "
            f"{request_count + 1}/{max_requests}"
        )
        
        return True


# Global rate limiter instance
rate_limiter = RateLimiter()


def rate_limit(max_requests: int = 5, window_seconds: int = 60):
    """
    Decorator to apply rate limiting to an endpoint.

    Args:
        max_requests: Maximum number of requests allowed in the window
        window_seconds: Time window in seconds (default: 60)

    Usage:
        @router.post("/signin")
        @rate_limit(max_requests=5, window_seconds=60)
        async def signin(...):
            ...
    """

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract request from kwargs
            request = kwargs.get("request")
            if not request:
                # Try to find request in args
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break

            if request:
                rate_limiter.check_rate_limit(request, max_requests, window_seconds)

            return await func(*args, **kwargs)

        return wrapper

    return decorator
