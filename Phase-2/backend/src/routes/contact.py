"""Contact form API routes."""

import logging
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

from src.schemas.contact import ContactRequest, ContactResponse
from src.services.email_service import get_email_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/contact", tags=["Contact"])


@router.post(
    "",
    response_model=ContactResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit contact form",
    description="Send a contact form message to support team"
)
async def submit_contact_form(request: ContactRequest) -> ContactResponse:
    """
    Submit contact form.
    
    This endpoint sends an email to the support team with the user's message.
    No authentication required.
    
    Args:
        request: Contact form data (name, email, subject, message)
        
    Returns:
        ContactResponse with success status and message
        
    Raises:
        HTTPException: If email sending fails
    """
    try:
        email_service = get_email_service()
        
        success = await email_service.send_contact_email(
            name=request.name,
            email=request.email,
            subject=request.subject,
            message=request.message
        )
        
        if success:
            logger.info(f"Contact form submitted by {request.name} ({request.email})")
            return ContactResponse(
                success=True,
                message="Your message has been sent successfully. We'll get back to you soon!"
            )
        else:
            logger.error(f"Failed to send contact email for {request.email}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send email. Please try again later or contact us directly at tara378581@gmail.com"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in contact form: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again later."
        )
