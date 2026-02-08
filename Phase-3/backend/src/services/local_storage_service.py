"""Local storage service as a fallback for file uploads and downloads."""

import io
import os
from typing import Optional
from pathlib import Path
from fastapi import HTTPException, status
from PIL import Image

class LocalStorageService:
    def __init__(self, storage_path: str = "./uploads"):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(exist_ok=True)

    async def upload_file(self, file_content: bytes, file_path: str, content_type: str) -> str:
        """
        Upload a file to local storage.

        Args:
            file_content: Raw file content as bytes
            file_path: Path where to store the file in the local storage
            content_type: MIME type of the file

        Returns:
            Public URL of the uploaded file
        """
        try:
            # Validate and process image if needed
            if content_type.startswith("image/"):
                file_content = await self._validate_and_process_image(file_content, content_type)

            # Create file path
            full_path = self.storage_path / file_path
            full_path.parent.mkdir(parents=True, exist_ok=True)

            # Write file to local storage
            with open(full_path, 'wb') as f:
                f.write(file_content)

            # Return local URL (would be served via a route)
            return f"/uploads/{file_path}"

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload file to local storage: {str(e)}"
            )

    async def download_file(self, file_path: str) -> bytes:
        """
        Download a file from local storage.

        Args:
            file_path: Path of the file in the local storage

        Returns:
            Raw file content as bytes
        """
        try:
            full_path = self.storage_path / file_path
            if not full_path.exists():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="File not found in local storage"
                )

            with open(full_path, 'rb') as f:
                return f.read()
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File not found in local storage: {str(e)}"
            )

    async def delete_file(self, file_path: str) -> bool:
        """
        Delete a file from local storage.

        Args:
            file_path: Path of the file in the local storage

        Returns:
            True if successful, False otherwise
        """
        try:
            full_path = self.storage_path / file_path
            if full_path.exists():
                os.remove(full_path)
                return True
            return False
        except Exception as e:
            print(f"Error deleting file from local storage: {str(e)}")
            return False

    async def test_connection(self) -> bool:
        """
        Test the connection to local storage.

        Returns:
            True if connection is successful, False otherwise
        """
        try:
            test_path = self.storage_path / "test_connection"
            test_path.touch()
            test_path.unlink()
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
_local_storage_service: Optional[LocalStorageService] = None


def get_local_storage_service() -> LocalStorageService:
    """
    Get the local storage service instance.

    Returns:
        LocalStorageService instance
    """
    global _local_storage_service
    if _local_storage_service is None:
        _local_storage_service = LocalStorageService()
    return _local_storage_service