"""Request logging middleware for tracking API requests."""

import time
import uuid
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import logging

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all HTTP requests with timing and request ID."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process request and log details.
        
        Args:
            request: Incoming HTTP request
            call_next: Next middleware/handler in chain
            
        Returns:
            HTTP response
        """
        # Generate unique request ID for tracing
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Start timer
        start_time = time.time()
        
        # Extract request details
        method = request.method
        path = request.url.path
        client_host = request.client.host if request.client else "unknown"
        
        # Log request start (debug level)
        logger.debug(
            f"[{request_id}] {method} {path} - Client: {client_host} - Started"
        )
        
        # Process request
        try:
            response = await call_next(request)
            
            # Calculate duration
            duration_ms = (time.time() - start_time) * 1000
            
            # Log successful request
            logger.info(
                f"[{request_id}] {method} {path} - "
                f"Status: {response.status_code} - "
                f"Duration: {duration_ms:.2f}ms - "
                f"Client: {client_host}"
            )
            
            # Add request ID to response headers for debugging
            response.headers["X-Request-ID"] = request_id
            
            return response
            
        except Exception as e:
            # Calculate duration
            duration_ms = (time.time() - start_time) * 1000
            
            # Log failed request
            logger.error(
                f"[{request_id}] {method} {path} - "
                f"Error: {str(e)} - "
                f"Duration: {duration_ms:.2f}ms - "
                f"Client: {client_host}",
                exc_info=True
            )
            
            # Re-raise the exception
            raise


def should_log_request(path: str) -> bool:
    """
    Determine if a request should be logged.
    
    Skip logging for health checks and static files to reduce noise.
    
    Args:
        path: Request path
        
    Returns:
        True if request should be logged
    """
    skip_paths = ["/health", "/docs", "/redoc", "/openapi.json", "/uploads"]
    return not any(path.startswith(skip_path) for skip_path in skip_paths)


def install_logging_middleware(app):
    """Install request logging middleware on the FastAPI app."""
    app.add_middleware(RequestLoggingMiddleware)
