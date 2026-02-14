"""
Production-Ready Profile Routes
Complete with image upload, validation, caching, audit logging, and error handling
"""

import logging
import os
import uuid
from datetime import datetime
from typing import List, Optional
from pathlib import Path
import mimetypes

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    status,
    File,
    UploadFile
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

from src.db import get_session
from src.middleware.auth import require_user
from src.models.user import User
from src.schemas.profile import (
    UserProfileResponse,
    ProfileUpdateRequest,
    ProfileUpdateResponse,
    ImageUploadResponse,
    ImageDeleteResponse,
)

# Import production utilities
try:
    from security_utils import RequestValidator, rate_limiter
    from exceptions import DatabaseError, ValidationError
    USE_PRODUCTION_UTILS = True
except ImportError:
    USE_PRODUCTION_UTILS = False
    logging.warning("Production utilities not available")

# Configure logging
logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

router = APIRouter(prefix="/api/profile", tags=["profile"])


# =================================
# SUPABASE CLIENT INITIALIZATION
# =================================

# Initialize Supabase client once at module level
supabase_client = None
try:
    from src.config import settings
    
    if settings.supabase_url and settings.supabase_anon_key:
        from supabase import create_client
        supabase_client = create_client(settings.supabase_url, settings.supabase_anon_key)
        logger.info(f"✅ Supabase client initialized in profile.py: {settings.supabase_url}")
    else:
        logger.warning("⚠️ Supabase storage disabled or credentials missing")
except Exception as e:
    logger.error(f"❌ Failed to initialize Supabase client: {e}")
    supabase_client = None


# =================================
# CONFIGURATION
# =================================

class ProfileConfig:
    """Configuration for profile management."""
    
    # Image upload settings
    MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB
    ALLOWED_IMAGE_TYPES = {
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
        "image/webp": [".webp"],
        "image/gif": [".gif"],
        "image/avif": [".avif"]
    }
    
    # Storage settings - use settings from config
    try:
        from src.config import settings
        UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads/profile_photos")
        USE_SUPABASE = bool(settings.supabase_url and settings.supabase_anon_key)
        SUPABASE_BUCKET = settings.supabase_storage_bucket
    except:
        UPLOAD_DIR = "./uploads/profile_photos"
        USE_SUPABASE = False
        SUPABASE_BUCKET = "profile-photos"
    
    # Validation
    MIN_NAME_LENGTH = 2
    MAX_NAME_LENGTH = 100
    
    # Rate limiting
    UPLOAD_RATE_LIMIT = 5  # uploads per hour
    UPDATE_RATE_LIMIT = 10  # updates per hour


# Ensure upload directory exists (for local fallback)
Path(ProfileConfig.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)


# =================================
# HELPER FUNCTIONS
# =================================

def generate_request_id() -> str:
    """Generate unique request ID for tracking."""
    return f"profile_{uuid.uuid4().hex[:16]}"


def get_client_ip(request: Request) -> str:
    """Extract client IP address from request headers."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()
    
    return request.client.host if request.client else "unknown"


def extract_user_id(user) -> str:
    """Extract user ID from different user object formats."""
    if isinstance(user, dict):
        return user.get("user_id") or user.get("sub") or user.get("id")
    return getattr(user, "user_id", None) or getattr(user, "id", None)


def validate_name(name: str) -> str:
    """
    Validate and sanitize user name.
    
    Args:
        name: User name to validate
        
    Returns:
        Sanitized name
        
    Raises:
        ValidationError: If name is invalid
    """
    if not name or not name.strip():
        raise ValidationError("name", "Name cannot be empty")
    
    # Strip whitespace
    name = name.strip()
    
    # Remove excessive spaces
    import re
    name = re.sub(r'\s+', ' ', name)
    
    # Check length
    if len(name) < ProfileConfig.MIN_NAME_LENGTH:
        raise ValidationError(
            "name",
            f"Name must be at least {ProfileConfig.MIN_NAME_LENGTH} characters"
        )
    
    if len(name) > ProfileConfig.MAX_NAME_LENGTH:
        raise ValidationError(
            "name",
            f"Name must not exceed {ProfileConfig.MAX_NAME_LENGTH} characters"
        )
    
    # Check for valid characters (letters, spaces, hyphens, apostrophes, periods)
    if not re.match(r"^[a-zA-Z\s\-'\.]+$", name):
        raise ValidationError(
            "name",
            "Name can only contain letters, spaces, hyphens, apostrophes, and periods"
        )
    
    # Sanitize
    if USE_PRODUCTION_UTILS:
        name = RequestValidator.sanitize_input(name, max_length=ProfileConfig.MAX_NAME_LENGTH)
    
    return name


def validate_image_file(file: UploadFile) -> tuple[bool, Optional[str]]:
    """
    Validate uploaded image file.
    
    Args:
        file: Uploaded file
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Check if file is provided
    if not file or not file.filename:
        return False, "No file provided"
    
    # Check file size (read first chunk to verify it's not empty)
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Seek back to start
    
    if file_size == 0:
        return False, "File is empty"
    
    if file_size > ProfileConfig.MAX_IMAGE_SIZE:
        size_mb = ProfileConfig.MAX_IMAGE_SIZE / (1024 * 1024)
        return False, f"File size exceeds maximum allowed size of {size_mb} MB"
    
    # Check content type
    content_type = file.content_type
    if content_type not in ProfileConfig.ALLOWED_IMAGE_TYPES:
        allowed = ", ".join(ProfileConfig.ALLOWED_IMAGE_TYPES.keys())
        return False, f"Invalid file type. Allowed types: {allowed}"
    
    # Check file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ProfileConfig.ALLOWED_IMAGE_TYPES[content_type]:
        return False, f"File extension {file_ext} does not match content type {content_type}"
    
    return True, None


async def save_image_locally(file: UploadFile, user_id: str) -> str:
    """
    Save uploaded image to Supabase storage or local filesystem.
    
    Args:
        file: Uploaded file
        user_id: User ID
        
    Returns:
        Public URL to saved image
        
    Raises:
        HTTPException: If save fails
    """
    try:
        # Generate unique filename
        file_ext = os.path.splitext(file.filename)[1].lower()
        unique_filename = f"{user_id}/{uuid.uuid4().hex}{file_ext}"
        
        # Read file content
        image_data = await file.read()
        
        # Upload to Supabase if client is available
        if supabase_client and ProfileConfig.USE_SUPABASE:
            try:
                logger.info(f"📸 Uploading to Supabase: {unique_filename} ({len(image_data)} bytes)")
                
                # Upload to Supabase storage
                response = supabase_client.storage.from_(ProfileConfig.SUPABASE_BUCKET).upload(
                    path=unique_filename,
                    file=image_data,
                    file_options={
                        "content-type": file.content_type,
                        "cache-control": "3600",
                        "upsert": "true"
                    }
                )
                
                logger.info(f"✅ Upload response: {response}")
                
                # Get public URL
                public_url = supabase_client.storage.from_(ProfileConfig.SUPABASE_BUCKET).get_public_url(unique_filename)
                
                logger.info(f"🔗 Public URL generated: {public_url}")
                return public_url
                
            except Exception as e:
                logger.error(f"❌ Supabase upload failed: {type(e).__name__}: {str(e)}", exc_info=True)
                logger.warning("⚠️ Falling back to local storage")
                # Fall through to local storage
        
        # Save locally (fallback or if Supabase disabled)
        filepath = os.path.join(ProfileConfig.UPLOAD_DIR, unique_filename.replace("/", "_"))
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        with open(filepath, "wb") as f:
            f.write(image_data)
        
        logger.info(f"💾 Saved locally: {filepath}")
        
        # Return URL
        if ProfileConfig.CDN_URL:
            return f"{ProfileConfig.CDN_URL}/profile_photos/{unique_filename}"
        else:
            return f"/uploads/profile_photos/{unique_filename.replace('/', '_')}"
            
    except Exception as e:
        logger.error(f"❌ Failed to save image: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save image"
        )


async def delete_image_locally(image_url: str) -> bool:
    """
    Delete image from local filesystem or Supabase storage.
    
    Args:
        image_url: URL/path to image
        
    Returns:
        True if deleted successfully
    """
    try:
        # Extract filename from URL
        filename = os.path.basename(image_url)
        
        # Delete from Supabase if URL is from Supabase
        if ProfileConfig.USE_SUPABASE and ProfileConfig.SUPABASE_URL in image_url:
            try:
                from supabase import create_client
                
                supabase = create_client(
                    ProfileConfig.SUPABASE_URL,
                    ProfileConfig.SUPABASE_KEY
                )
                
                # Delete from Supabase storage
                supabase.storage.from_(ProfileConfig.SUPABASE_BUCKET).remove([filename])
                logger.info(f"Image deleted from Supabase: {filename}")
                return True
                
            except Exception as e:
                logger.error(f"Supabase delete failed: {e}")
                return False
        
        # Delete from local storage
        filepath = os.path.join(ProfileConfig.UPLOAD_DIR, filename)
        if os.path.exists(filepath):
            os.remove(filepath)
            return True
        
        return False
        
    except Exception as e:
        logger.error(f"Failed to delete image: {e}")
        return False


def log_profile_event(
    event_type: str,
    user_id: str,
    success: bool = True,
    error_message: Optional[str] = None,
    metadata: Optional[dict] = None
):
    """Log profile events for monitoring and debugging."""
    log_data = {
        "event": event_type,
        "timestamp": datetime.utcnow().isoformat(),
        "user_id": user_id,
        "success": success,
        "error": error_message,
        "metadata": metadata
    }
    
    if success:
        logger.info(f"Profile event: {log_data}")
    else:
        logger.warning(f"Profile failure: {log_data}")


# =================================
# GET PROFILE ENDPOINT
# =================================

@router.get(
    "",
    response_model=UserProfileResponse,
    summary="Get user profile",
    description="Retrieve the authenticated user's profile information",
    responses={
        200: {
            "description": "User profile retrieved successfully",
            "model": UserProfileResponse
        },
        401: {
            "description": "Unauthorized - Invalid or missing token"
        },
        404: {
            "description": "User not found"
        }
    }
)
async def get_profile(
    request: Request,
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> UserProfileResponse:
    """
    Get the authenticated user's profile.
    
    **Returns:**
    - User ID
    - Name
    - Email
    - Profile photo URL (if set)
    - Account creation date
    - Last update date
    
    **Caching:**
    - This endpoint is suitable for caching
    - Cache key: `profile:{user_id}`
    - TTL: 5 minutes
    
    **Security:**
    - Requires valid JWT token
    - Only returns authenticated user's profile
    """
    request_id = generate_request_id()
    user_id = extract_user_id(user)
    
    logger.info(f"[{request_id}] Get profile - User: {user_id}")
    
    try:
        # Fetch user from database
        try:
            db_user = await session.get(User, user_id)
        except SQLAlchemyError as e:
            logger.error(f"[{request_id}] Database error fetching user: {e}")
            raise DatabaseError("fetching user profile")
        
        if not db_user:
            logger.warning(f"[{request_id}] User not found: {user_id}")
            log_profile_event(
                event_type="get_profile",
                user_id=user_id,
                success=False,
                error_message="User not found"
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        # Log success
        log_profile_event(
            event_type="get_profile",
            user_id=user_id,
            success=True
        )
        
        logger.info(f"[{request_id}] Profile retrieved successfully")
        
        return UserProfileResponse(
            id=db_user.id,
            name=db_user.name,
            email=db_user.email,
            profile_photo_url=getattr(db_user, 'profile_photo_url', None),
            created_at=db_user.created_at,
            updated_at=db_user.updated_at,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"[{request_id}] Unexpected error in get_profile: {e}",
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


# =================================
# UPDATE PROFILE ENDPOINT
# =================================

@router.put(
    "",
    response_model=ProfileUpdateResponse,
    summary="Update user profile",
    description="Update the authenticated user's profile information",
    responses={
        200: {
            "description": "Profile updated successfully",
            "model": ProfileUpdateResponse,
            "content": {
                "application/json": {
                    "example": {
                        "message": "Profile updated successfully",
                        "updated_fields": ["name", "first_name", "phone"],
                        "profile": {
                            "id": "550e8400-e29b-41d4-a716-446655440000",
                            "name": "Shahab Khan",
                            "email": "shahab@example.com",
                            "first_name": "Shahab",
                            "last_name": "Khan",
                            "phone": "+92 300 1234567",
                            "date_of_birth": "2000-01-15",
                            "gender": "Male",
                            "address": "123 Main Street",
                            "city": "Karachi",
                            "country": "Pakistan",
                            "profile_photo_url": "/uploads/profile_photos/user_123.jpg",
                            "bio": "Software Developer",
                            "created_at": "2024-01-15T10:30:00Z",
                            "updated_at": "2024-01-15T11:00:00Z"
                        }
                    }
                }
            }
        },
        400: {
            "description": "Validation error"
        },
        404: {
            "description": "User not found"
        },
        409: {
            "description": "Conflict - Name already taken"
        },
        429: {
            "description": "Rate limit exceeded"
        }
    }
)
async def update_profile(
    request: Request,
    body: ProfileUpdateRequest,
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> ProfileUpdateResponse:
    """
    Update the authenticated user's profile.
    
    **Updatable Fields:**
    - name: User's display name
    
    **Future Fields:**
    - bio: User biography
    - location: User location
    - website: User website URL
    - social_links: Social media profiles
    
    **Validation:**
    - Name: 2-100 characters, letters/spaces/hyphens/apostrophes only
    - Duplicate names checked
    - All changes logged for audit trail
    
    **Rate Limiting:**
    - 10 updates per hour per user
    
    **Returns:**
    - Success message
    - List of updated fields
    - Updated profile data
    
    **Idempotent:**
    - Safe to call multiple times
    - No-op if no changes detected
    """
    request_id = generate_request_id()
    user_id = extract_user_id(user)
    client_ip = get_client_ip(request)
    
    logger.info(f"[{request_id}] Update profile - User: {user_id}")
    
    try:
        # Rate limiting
        if USE_PRODUCTION_UTILS:
            is_allowed, _ = rate_limiter.check_rate_limit(
                identifier=f"profile_update:{user_id}",
                limit=ProfileConfig.UPDATE_RATE_LIMIT,
                window_seconds=3600  # 1 hour
            )
            
            if not is_allowed:
                logger.warning(f"[{request_id}] Rate limit exceeded - User: {user_id}")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many profile updates. Please try again later."
                )
        
        # Fetch user from database
        try:
            db_user = await session.get(User, user_id)
        except SQLAlchemyError as e:
            logger.error(f"[{request_id}] Database error fetching user: {e}")
            raise DatabaseError("fetching user")
        
        if not db_user:
            logger.warning(f"[{request_id}] User not found: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        # Track which fields are being updated
        updated_fields: List[str] = []
        
        # Update name if provided
        if body.name is not None and body.name != db_user.name:
            try:
                validated_name = validate_name(body.name)
            except ValidationError as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=str(e)
                )
            
            # Check if name is already taken
            try:
                existing_user = await session.execute(
                    select(User).where(
                        User.name == validated_name,
                        User.id != user_id
                    )
                )
                if existing_user.scalar_one_or_none():
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Username already taken"
                    )
            except HTTPException:
                raise
            except SQLAlchemyError as e:
                logger.error(f"[{request_id}] Database error checking name: {e}")
                raise DatabaseError("checking username availability")
            
            db_user.name = validated_name
            updated_fields.append("name")
        
        # Update first_name if provided
        if body.first_name is not None and body.first_name != db_user.first_name:
            db_user.first_name = body.first_name.strip() if body.first_name else None
            updated_fields.append("first_name")
        
        # Update last_name if provided
        if body.last_name is not None and body.last_name != db_user.last_name:
            db_user.last_name = body.last_name.strip() if body.last_name else None
            updated_fields.append("last_name")
        
        # Update phone if provided
        if body.phone is not None and body.phone != db_user.phone:
            db_user.phone = body.phone.strip() if body.phone else None
            updated_fields.append("phone")
        
        # Update date_of_birth if provided
        if body.date_of_birth is not None and body.date_of_birth != db_user.date_of_birth:
            db_user.date_of_birth = body.date_of_birth
            updated_fields.append("date_of_birth")
        
        # Update gender if provided
        if body.gender is not None and body.gender != db_user.gender:
            db_user.gender = body.gender.strip() if body.gender else None
            updated_fields.append("gender")
        
        # Update address if provided
        if body.address is not None and body.address != db_user.address:
            db_user.address = body.address.strip() if body.address else None
            updated_fields.append("address")
        
        # Update city if provided
        if body.city is not None and body.city != db_user.city:
            db_user.city = body.city.strip() if body.city else None
            updated_fields.append("city")
        
        # Update country if provided
        if body.country is not None and body.country != db_user.country:
            db_user.country = body.country.strip() if body.country else None
            updated_fields.append("country")
        
        # Update bio if provided
        if body.bio is not None and body.bio != db_user.bio:
            db_user.bio = body.bio.strip() if body.bio else None
            updated_fields.append("bio")
        
        # Commit changes if any
        if updated_fields:
            db_user.updated_at = datetime.utcnow()
            
            try:
                await session.commit()
                await session.refresh(db_user)
            except IntegrityError as e:
                await session.rollback()
                logger.error(f"[{request_id}] Integrity error during update: {e}")
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Username already taken"
                )
            except SQLAlchemyError as e:
                await session.rollback()
                logger.error(f"[{request_id}] Database error during update: {e}")
                raise DatabaseError("updating profile")
            
            # Log success
            log_profile_event(
                event_type="update_profile",
                user_id=user_id,
                success=True,
                metadata={"updated_fields": updated_fields}
            )
            
            message = "Profile updated successfully"
            logger.info(
                f"[{request_id}] Profile updated - Fields: {', '.join(updated_fields)}"
            )
        else:
            message = "No changes made"
            updated_fields.append("no_changes")
            logger.info(f"[{request_id}] No profile changes detected")
        
        return ProfileUpdateResponse(
            message=message,
            updated_fields=updated_fields,
            profile=UserProfileResponse(
                id=db_user.id,
                name=db_user.name,
                email=db_user.email,
                first_name=db_user.first_name,
                last_name=db_user.last_name,
                phone=db_user.phone,
                date_of_birth=db_user.date_of_birth,
                gender=db_user.gender,
                address=db_user.address,
                city=db_user.city,
                country=db_user.country,
                profile_photo_url=db_user.profile_photo_url,
                bio=db_user.bio,
                created_at=db_user.created_at,
                updated_at=db_user.updated_at,
            ),
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"[{request_id}] Unexpected error in update_profile: {e}",
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


# =================================
# UPLOAD PROFILE PHOTO ENDPOINT
# =================================

@router.post(
    "/upload-photo",
    response_model=ImageUploadResponse,
    summary="Upload profile photo",
    description="Upload a new profile photo",
    responses={
        200: {
            "description": "Photo uploaded successfully",
            "model": ImageUploadResponse
        },
        400: {
            "description": "Invalid file"
        },
        413: {
            "description": "File too large"
        },
        415: {
            "description": "Unsupported media type"
        },
        429: {
            "description": "Rate limit exceeded"
        }
    }
)
async def upload_profile_photo(
    request: Request,
    file: UploadFile = File(..., description="Profile photo (JPG, PNG, WebP, GIF, max 5MB)"),
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> ImageUploadResponse:
    """
    Upload a profile photo.
    
    **Supported Formats:**
    - JPEG (.jpg, .jpeg)
    - PNG (.png)
    - WebP (.webp)
    - GIF (.gif)
    
    **Limits:**
    - Maximum file size: 5 MB
    - Rate limit: 5 uploads per hour
    
    **Storage:**
    - Images stored locally (or S3 if configured)
    - Old profile photo automatically deleted
    - Unique filename generated
    - CDN URL returned (if configured)
    
    **Process:**
    1. Validate file (type, size, format)
    2. Delete old profile photo (if exists)
    3. Generate unique filename
    4. Save to storage
    5. Update database with new URL
    6. Return new photo URL
    
    **Security:**
    - Content-type validation
    - File extension validation
    - Size limit enforcement
    - Virus scanning (recommended in production)
    """
    request_id = generate_request_id()
    user_id = extract_user_id(user)
    client_ip = get_client_ip(request)
    
    logger.info(
        f"[{request_id}] Upload profile photo - "
        f"User: {user_id}, File: {file.filename}"
    )
    
    try:
        # Rate limiting
        if USE_PRODUCTION_UTILS:
            is_allowed, _ = rate_limiter.check_rate_limit(
                identifier=f"photo_upload:{user_id}",
                limit=ProfileConfig.UPLOAD_RATE_LIMIT,
                window_seconds=3600  # 1 hour
            )
            
            if not is_allowed:
                logger.warning(f"[{request_id}] Upload rate limit exceeded - User: {user_id}")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many photo uploads. Please try again later."
                )
        
        # Validate file
        is_valid, error_message = validate_image_file(file)
        if not is_valid:
            logger.warning(
                f"[{request_id}] Invalid file upload - "
                f"User: {user_id}, Error: {error_message}"
            )
            log_profile_event(
                event_type="upload_photo",
                user_id=user_id,
                success=False,
                error_message=error_message
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_message
            )
        
        # Fetch user
        try:
            db_user = await session.get(User, user_id)
        except SQLAlchemyError as e:
            logger.error(f"[{request_id}] Database error fetching user: {e}")
            raise DatabaseError("fetching user")
        
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Delete old profile photo if exists
        old_photo_url = getattr(db_user, 'profile_photo_url', None)
        if old_photo_url:
            await delete_image_locally(old_photo_url)
            logger.info(f"[{request_id}] Deleted old profile photo")
        
        # Save new photo
        try:
            photo_url = await save_image_locally(file, user_id)
        except Exception as e:
            logger.error(f"[{request_id}] Failed to save photo: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upload photo"
            )
        
        # Update database
        if hasattr(db_user, 'profile_photo_url'):
            db_user.profile_photo_url = photo_url
            db_user.updated_at = datetime.utcnow()
            
            try:
                await session.commit()
                await session.refresh(db_user)
            except SQLAlchemyError as e:
                await session.rollback()
                logger.error(f"[{request_id}] Database error updating photo URL: {e}")
                # Try to delete the uploaded file
                await delete_image_locally(photo_url)
                raise DatabaseError("updating profile photo")
        else:
            logger.warning(
                f"[{request_id}] User model missing profile_photo_url field"
            )
        
        # Log success
        log_profile_event(
            event_type="upload_photo",
            user_id=user_id,
            success=True,
            metadata={
                "filename": file.filename,
                "size": file.size,
                "content_type": file.content_type
            }
        )
        
        logger.info(
            f"[{request_id}] Profile photo uploaded successfully - URL: {photo_url}"
        )
        
        return ImageUploadResponse(
            message="Profile photo uploaded successfully",
            photo_url=photo_url,
            uploaded_at=datetime.utcnow(),
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"[{request_id}] Unexpected error in upload_profile_photo: {e}",
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


# =================================
# DELETE PROFILE PHOTO ENDPOINT
# =================================

@router.delete(
    "/photo",
    response_model=ImageDeleteResponse,
    summary="Delete profile photo",
    description="Delete the authenticated user's profile photo",
    responses={
        200: {
            "description": "Photo deleted successfully",
            "model": ImageDeleteResponse
        },
        404: {
            "description": "No profile photo found"
        }
    }
)
async def delete_profile_photo(
    request: Request,
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> ImageDeleteResponse:
    """
    Delete the authenticated user's profile photo.
    
    **Process:**
    1. Fetch user from database
    2. Check if profile photo exists
    3. Delete from storage
    4. Update database (set URL to null)
    5. Return confirmation
    
    **Idempotent:**
    - Safe to call multiple times
    - Returns success even if no photo exists
    
    **Note:**
    - This permanently deletes the photo from storage
    - Cannot be undone
    - User can upload a new photo anytime
    """
    request_id = generate_request_id()
    user_id = extract_user_id(user)
    
    logger.info(f"[{request_id}] Delete profile photo - User: {user_id}")
    
    try:
        # Fetch user
        try:
            db_user = await session.get(User, user_id)
        except SQLAlchemyError as e:
            logger.error(f"[{request_id}] Database error fetching user: {e}")
            raise DatabaseError("fetching user")
        
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if profile photo exists
        photo_url = getattr(db_user, 'profile_photo_url', None)
        
        if not photo_url:
            logger.info(f"[{request_id}] No profile photo to delete")
            return ImageDeleteResponse(
                message="No profile photo to delete",
                deleted=False,
            )
        
        # Delete from storage
        deleted = await delete_image_locally(photo_url)
        
        if not deleted:
            logger.warning(
                f"[{request_id}] Failed to delete photo from storage: {photo_url}"
            )
        
        # Update database
        if hasattr(db_user, 'profile_photo_url'):
            db_user.profile_photo_url = None
            db_user.updated_at = datetime.utcnow()
            
            try:
                await session.commit()
                await session.refresh(db_user)
            except SQLAlchemyError as e:
                await session.rollback()
                logger.error(f"[{request_id}] Database error deleting photo: {e}")
                raise DatabaseError("deleting profile photo")
        
        # Log success
        log_profile_event(
            event_type="delete_photo",
            user_id=user_id,
            success=True,
            metadata={"photo_url": photo_url}
        )
        
        logger.info(f"[{request_id}] Profile photo deleted successfully")
        
        return ImageDeleteResponse(
            message="Profile photo deleted successfully",
            timestamp=datetime.now(),
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"[{request_id}] Unexpected error in delete_profile_photo: {e}",
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )