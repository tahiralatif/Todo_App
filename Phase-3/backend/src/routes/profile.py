"""Profile routes for managing user profiles."""

import uuid
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.db import get_session
from src.middleware.auth import require_user
from src.models.user import User
from src.models.notification import NotificationType
from src.schemas.profile import (
    UserProfileResponse,
    ProfileUpdateRequest,
    ProfileUpdateResponse,
    ImageUploadResponse,
    ImageDeleteResponse
)
from src.schemas.notification import NotificationResponse
from src.services.notification_service import NotificationService
from src.services.supabase_storage_service import get_supabase_storage_service

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("", response_model=UserProfileResponse)
async def get_profile(
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> UserProfileResponse:
    """
    Get the authenticated user's profile.
    """
    db_user = await session.get(User, user.user_id)

    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return UserProfileResponse(
        id=db_user.id,
        name=db_user.name,
        email=db_user.email,
        profile_photo_url=db_user.profile_photo_url,
        bio=db_user.bio,
        last_name=db_user.last_name,
        date_of_birth=db_user.date_of_birth,
        address=db_user.address,
        phone_number=db_user.phone_number,
        gender=db_user.gender,
        created_at=db_user.created_at,
        updated_at=db_user.updated_at,
    )


@router.put("", response_model=ProfileUpdateResponse)
async def update_profile(
    request: ProfileUpdateRequest,
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> ProfileUpdateResponse:
    """
    Update the authenticated user's profile.
    """
    db_user = await session.get(User, user.user_id)

    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Track which fields are being updated
    updated_fields: List[str] = []

    # Update fields if provided in request
    if request.name is not None and request.name != db_user.name:
        db_user.name = request.name
        updated_fields.append("name")

    if request.bio is not None and request.bio != db_user.bio:
        db_user.bio = request.bio
        updated_fields.append("bio")

    if request.last_name is not None and request.last_name != db_user.last_name:
        db_user.last_name = request.last_name
        updated_fields.append("last_name")

    if request.date_of_birth is not None and request.date_of_birth != db_user.date_of_birth:
        db_user.date_of_birth = request.date_of_birth
        updated_fields.append("date_of_birth")

    if request.address is not None and request.address != db_user.address:
        db_user.address = request.address
        updated_fields.append("address")

    if request.phone_number is not None and request.phone_number != db_user.phone_number:
        db_user.phone_number = request.phone_number
        updated_fields.append("phone_number")

    if request.gender is not None and request.gender != db_user.gender:
        db_user.gender = request.gender
        updated_fields.append("gender")

    if updated_fields:
        db_user.updated_at = datetime.now()
        await session.commit()
        await session.refresh(db_user)

        # Create notification for profile update
        await NotificationService.create_profile_update_notification(
            session=session,
            user_id=db_user.id,
            user_name=db_user.name,
            updated_fields=updated_fields,
        )
    else:
        # No changes were made
        updated_fields.append("no_changes")

    return ProfileUpdateResponse(
        message="Profile updated successfully" if "no_changes" not in updated_fields else "No changes made",
        updated_fields=updated_fields,
        profile=UserProfileResponse(
            id=db_user.id,
            name=db_user.name,
            email=db_user.email,
            profile_photo_url=db_user.profile_photo_url,
            bio=db_user.bio,
            last_name=db_user.last_name,
            date_of_birth=db_user.date_of_birth,
            address=db_user.address,
            phone_number=db_user.phone_number,
            gender=db_user.gender,
            created_at=db_user.created_at,
            updated_at=db_user.updated_at,
        )
    )


@router.post("/upload-photo", response_model=ImageUploadResponse)
async def upload_profile_photo(
    file: UploadFile = File(...),
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> ImageUploadResponse:
    """
    Upload a profile photo to Supabase storage.
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}",
        )

    # Read file content
    file_content = await file.read()

    # Validate file size (max 5MB)
    if len(file_content) > 5 * 1024 * 1024:  # 5MB
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large (max 5MB)",
        )

    # Get user
    db_user = await session.get(User, user.user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Generate unique filename
    file_ext = file.filename.split('.')[-1].lower() if '.' in file.filename else 'jpg'
    unique_filename = f"profile-photos/{db_user.id}/{uuid.uuid4()}.{file_ext}"

    # Get Supabase storage service
    storage_service = get_supabase_storage_service()

    try:
        # Upload to Supabase
        public_url = await storage_service.upload_file(
            file_content=file_content,
            file_path=unique_filename,
            content_type=file.content_type,
        )

        # If user had an existing profile photo, delete it from storage
        if db_user.profile_photo_url:
            try:
                # Extract the path from the URL for deletion
                path_parts = db_user.profile_photo_url.split('/storage/v1/object/public/')
                if len(path_parts) > 1:
                    old_path = path_parts[1]
                    await storage_service.delete_file(old_path)
            except Exception as e:
                # If deletion fails, log but don't fail the upload
                print(f"Warning: Could not delete old profile photo: {e}")

        # Update user's profile photo URL in database
        db_user.profile_photo_url = public_url
        db_user.updated_at = datetime.now()
        await session.commit()
        await session.refresh(db_user)

        # Create notification for profile photo update
        await NotificationService.create_profile_update_notification(
            session=session,
            user_id=db_user.id,
            user_name=db_user.name,
            updated_fields=["profile_photo"],
        )

        return ImageUploadResponse(
            message="Profile photo uploaded successfully",
            status="success",
            profile_photo_url=public_url,
            timestamp=datetime.now(),
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload profile photo: {str(e)}",
        )


@router.delete("/photo", response_model=ImageDeleteResponse)
async def delete_profile_photo(
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> ImageDeleteResponse:
    """
    Delete the authenticated user's profile photo.
    """
    db_user = await session.get(User, user.user_id)

    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if not db_user.profile_photo_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No profile photo to delete",
        )

    # Get Supabase storage service
    storage_service = get_supabase_storage_service()

    try:
        # Extract the path from the URL for deletion
        path_parts = db_user.profile_photo_url.split('/storage/v1/object/public/')
        if len(path_parts) > 1:
            file_path = path_parts[1]
            await storage_service.delete_file(file_path)

        # Remove the photo URL from the user record
        db_user.profile_photo_url = None
        db_user.updated_at = datetime.now()
        await session.commit()
        await session.refresh(db_user)

        # Create notification for profile photo deletion
        await NotificationService.create_profile_update_notification(
            session=session,
            user_id=db_user.id,
            user_name=db_user.name,
            updated_fields=["profile_photo"],
        )

        return ImageDeleteResponse(
            message="Profile photo deleted successfully",
            timestamp=datetime.now(),
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete profile photo: {str(e)}",
        )