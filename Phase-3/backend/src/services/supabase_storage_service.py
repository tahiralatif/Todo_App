"""Supabase storage service for handling file uploads and downloads."""

import io
from typing import Optional
from urllib.parse import urlparse

from fastapi import HTTPException, status
from PIL import Image
from supabase import Client, create_client

from src.config import settings


class SupabaseStorageService:
    def __init__(self):
        if not settings.supabase_url or not settings.supabase_anon_key:
            raise ValueError("Supabase configuration is incomplete")

        self.client: Client = create_client(settings.supabase_url, settings.supabase_anon_key)
        self.bucket_name = settings.supabase_storage_bucket

    async def upload_file(self, file_content: bytes, file_path: str, content_type: str) -> str:
        """
        Upload a file to Supabase storage.

        Args:
            file_content: Raw file content as bytes
            file_path: Path where to store the file in the bucket
            content_type: MIME type of the file

        Returns:
            Public URL of the uploaded file
        """
        try:
            # Validate and process image if needed
            if content_type.startswith("image/"):
                file_content = await self._validate_and_process_image(file_content, content_type)

            # Upload to Supabase
            response = self.client.storage.from_(self.bucket_name).upload(
                path=file_path,
                file=file_content,
                file_options={
                    "content-type": content_type,
                    "cache-control": "3600",
                    "upsert": "true"
                }
            )

            # Get public URL
            public_url = self.client.storage.from_(self.bucket_name).get_public_url(file_path)
            return public_url

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload file to Supabase: {str(e)}"
            )

    async def download_file(self, file_path: str) -> bytes:
        """
        Download a file from Supabase storage.

        Args:
            file_path: Path of the file in the bucket

        Returns:
            Raw file content as bytes
        """
        try:
            response = self.client.storage.from_(self.bucket_name).download(file_path)
            return response
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File not found in Supabase: {str(e)}"
            )

    async def delete_file(self, file_path: str) -> bool:
        """
        Delete a file from Supabase storage.

        Args:
            file_path: Path of the file in the bucket

        Returns:
            True if successful, False otherwise
        """
        try:
            self.client.storage.from_(self.bucket_name).remove([file_path])
            return True
        except Exception as e:
            print(f"Error deleting file from Supabase: {str(e)}")
            return False

    async def test_connection(self) -> bool:
        """
        Test the connection to Supabase storage.

        Returns:
            True if connection is successful, False otherwise
        """
        try:
            # Try listing files in the bucket as a connectivity test
            response = self.client.storage.from_(self.bucket_name).list("")
            return True
        except Exception:
            return False

    async def _validate_and_process_image(self, image_content: bytes, content_type: str) -> bytes:
        """
        Validate and process an image file.

        Args:
            image_content: Raw image content as bytes
            content_type: MIME type of the image

        Returns:
            Processed image content as bytes
        """
        try:
            # Check file size (max 5MB)
            if len(image_content) > 5 * 1024 * 1024:  # 5MB
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Image file too large (max 5MB)"
                )

            # Validate image format using PIL
            img = Image.open(io.BytesIO(image_content))

            # Check dimensions (optional: limit to reasonable sizes)
            if img.width > 4000 or img.height > 4000:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Image dimensions too large (max 4000x4000)"
                )

            # If the image is valid, return the original content
            return image_content

        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid image file: {str(e)}"
            )


# Global instance
_supabase_storage_service: Optional[SupabaseStorageService] = None


def get_supabase_storage_service() -> SupabaseStorageService:
    """
    Get the Supabase storage service instance.

    Returns:
        SupabaseStorageService instance
    """
    global _supabase_storage_service
    if _supabase_storage_service is None:
        _supabase_storage_service = SupabaseStorageService()
    return _supabase_storage_service