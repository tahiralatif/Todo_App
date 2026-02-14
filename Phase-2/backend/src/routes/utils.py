"""Security utilities for production authentication system."""

import hashlib
import secrets
import string
from datetime import datetime, timedelta
from typing import Optional

import bcrypt
from jose import JWTError, jwt


class SecurityConfig:
    """Security configuration constants."""

    # JWT Settings
    SECRET_KEY: str = None  # Set via environment variable
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # 1 hour
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30  # 30 days
    
    # Password Settings
    BCRYPT_ROUNDS: int = 12  # Bcrypt cost factor
    
    # Rate Limiting (requests per time window)
    LOGIN_RATE_LIMIT: int = 5  # per 15 minutes
    SIGNUP_RATE_LIMIT: int = 3  # per hour
    PASSWORD_RESET_RATE_LIMIT: int = 3  # per hour
    
    # Token Settings
    RESET_TOKEN_EXPIRE_MINUTES: int = 30
    VERIFICATION_TOKEN_EXPIRE_HOURS: int = 24
    
    # Security Headers
    SECURE_HEADERS = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "Content-Security-Policy": "default-src 'self'",
    }


class PasswordHasher:
    """Secure password hashing utilities using bcrypt."""

    @staticmethod
    def hash_password(password: str) -> str:
        """
        Hash a password using bcrypt.
        
        Args:
            password: Plain text password
            
        Returns:
            Hashed password string
        """
        salt = bcrypt.gensalt(rounds=SecurityConfig.BCRYPT_ROUNDS)
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verify a password against its hash.
        
        Args:
            plain_password: Plain text password to verify
            hashed_password: Stored hashed password
            
        Returns:
            True if password matches, False otherwise
        """
        try:
            return bcrypt.checkpw(
                plain_password.encode('utf-8'),
                hashed_password.encode('utf-8')
            )
        except Exception:
            return False

    @staticmethod
    def needs_rehash(hashed_password: str) -> bool:
        """
        Check if password hash needs to be updated (due to cost factor change).
        
        Args:
            hashed_password: Current hashed password
            
        Returns:
            True if rehashing is recommended
        """
        try:
            # Extract current cost factor from hash
            parts = hashed_password.split('$')
            if len(parts) >= 3:
                current_cost = int(parts[2])
                return current_cost < SecurityConfig.BCRYPT_ROUNDS
        except Exception:
            pass
        return False


class TokenManager:
    """JWT token creation and verification."""

    @staticmethod
    def create_access_token(
        user_id: str,
        email: str,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Create a JWT access token.
        
        Args:
            user_id: User UUID
            email: User email
            expires_delta: Custom expiration time (optional)
            
        Returns:
            Encoded JWT token
        """
        if expires_delta is None:
            expires_delta = timedelta(
                minutes=SecurityConfig.ACCESS_TOKEN_EXPIRE_MINUTES
            )
        
        expire = datetime.utcnow() + expires_delta
        
        payload = {
            "sub": user_id,  # Subject (user ID)
            "email": email,
            "exp": expire,  # Expiration time
            "iat": datetime.utcnow(),  # Issued at
            "type": "access"
        }
        
        return jwt.encode(
            payload,
            SecurityConfig.SECRET_KEY,
            algorithm=SecurityConfig.ALGORITHM
        )

    @staticmethod
    def create_refresh_token(user_id: str) -> str:
        """
        Create a JWT refresh token.
        
        Args:
            user_id: User UUID
            
        Returns:
            Encoded JWT refresh token
        """
        expires_delta = timedelta(days=SecurityConfig.REFRESH_TOKEN_EXPIRE_DAYS)
        expire = datetime.utcnow() + expires_delta
        
        payload = {
            "sub": user_id,
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh",
            "jti": secrets.token_urlsafe(32)  # JWT ID for token rotation
        }
        
        return jwt.encode(
            payload,
            SecurityConfig.SECRET_KEY,
            algorithm=SecurityConfig.ALGORITHM
        )

    @staticmethod
    def verify_token(token: str, token_type: str = "access") -> Optional[dict]:
        """
        Verify and decode a JWT token.
        
        Args:
            token: JWT token to verify
            token_type: Expected token type ("access" or "refresh")
            
        Returns:
            Decoded payload if valid, None otherwise
        """
        try:
            payload = jwt.decode(
                token,
                SecurityConfig.SECRET_KEY,
                algorithms=[SecurityConfig.ALGORITHM]
            )
            
            # Verify token type
            if payload.get("type") != token_type:
                return None
            
            return payload
            
        except JWTError:
            return None

    @staticmethod
    def generate_reset_token() -> str:
        """
        Generate a secure password reset token.
        
        Returns:
            URL-safe random token
        """
        return secrets.token_urlsafe(32)

    @staticmethod
    def generate_verification_token() -> str:
        """
        Generate a secure email verification token.
        
        Returns:
            URL-safe random token
        """
        return secrets.token_urlsafe(32)

    @staticmethod
    def hash_token(token: str) -> str:
        """
        Hash a token for secure storage.
        
        Args:
            token: Token to hash
            
        Returns:
            SHA-256 hashed token
        """
        return hashlib.sha256(token.encode()).hexdigest()


class RequestValidator:
    """Request validation and sanitization utilities."""

    @staticmethod
    def sanitize_input(value: str, max_length: int = 1000) -> str:
        """
        Sanitize user input to prevent injection attacks.
        
        Args:
            value: Input string to sanitize
            max_length: Maximum allowed length
            
        Returns:
            Sanitized string
        """
        if not value:
            return ""
        
        # Remove null bytes
        value = value.replace('\x00', '')
        
        # Trim to max length
        value = value[:max_length]
        
        # Strip leading/trailing whitespace
        value = value.strip()
        
        return value

    @staticmethod
    def is_valid_uuid(value: str) -> bool:
        """
        Validate UUID format.
        
        Args:
            value: String to validate as UUID
            
        Returns:
            True if valid UUID format
        """
        import re
        uuid_pattern = re.compile(
            r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
            re.IGNORECASE
        )
        return bool(uuid_pattern.match(value))

    @staticmethod
    def generate_request_id() -> str:
        """
        Generate a unique request ID for logging and tracking.
        
        Returns:
            Unique request ID
        """
        return f"req_{secrets.token_urlsafe(16)}"


class RateLimiter:
    """In-memory rate limiter for authentication endpoints."""

    def __init__(self):
        """Initialize rate limiter with in-memory storage."""
        self._attempts: dict = {}  # {key: [(timestamp, count), ...]}

    def check_rate_limit(
        self,
        identifier: str,
        limit: int,
        window_seconds: int
    ) -> tuple[bool, int]:
        """
        Check if request is within rate limit.
        
        Args:
            identifier: Unique identifier (e.g., IP address or user ID)
            limit: Maximum number of requests allowed
            window_seconds: Time window in seconds
            
        Returns:
            Tuple of (is_allowed, remaining_attempts)
        """
        now = datetime.utcnow()
        cutoff = now - timedelta(seconds=window_seconds)
        
        # Clean old attempts
        if identifier in self._attempts:
            self._attempts[identifier] = [
                (ts, count) for ts, count in self._attempts[identifier]
                if ts > cutoff
            ]
        else:
            self._attempts[identifier] = []
        
        # Count current attempts
        current_count = sum(count for _, count in self._attempts[identifier])
        
        if current_count >= limit:
            return False, 0
        
        # Record this attempt
        self._attempts[identifier].append((now, 1))
        
        remaining = limit - (current_count + 1)
        return True, remaining

    def reset(self, identifier: str):
        """Reset rate limit for an identifier."""
        if identifier in self._attempts:
            del self._attempts[identifier]


# Global rate limiter instance
rate_limiter = RateLimiter()


class SecurityHeaders:
    """Security headers middleware helper."""

    @staticmethod
    def get_security_headers() -> dict:
        """
        Get recommended security headers.
        
        Returns:
            Dictionary of security headers
        """
        return SecurityConfig.SECURE_HEADERS.copy()

    @staticmethod
    def add_cors_headers(
        allowed_origins: list[str],
        allow_credentials: bool = True
    ) -> dict:
        """
        Generate CORS headers.
        
        Args:
            allowed_origins: List of allowed origin URLs
            allow_credentials: Whether to allow credentials
            
        Returns:
            Dictionary of CORS headers
        """
        return {
            "Access-Control-Allow-Origin": ",".join(allowed_origins),
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": str(allow_credentials).lower(),
            "Access-Control-Max-Age": "86400",  # 24 hours
        }


def generate_secure_random_string(length: int = 32) -> str:
    """
    Generate a cryptographically secure random string.
    
    Args:
        length: Length of the random string
        
    Returns:
        Random alphanumeric string
    """
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def constant_time_compare(val1: str, val2: str) -> bool:
    """
    Compare two strings in constant time to prevent timing attacks.
    
    Args:
        val1: First string
        val2: Second string
        
    Returns:
        True if strings match
    """
    return secrets.compare_digest(val1, val2)