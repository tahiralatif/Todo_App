"""Contact form schemas."""

from pydantic import BaseModel, EmailStr, Field


class ContactRequest(BaseModel):
    """Contact form submission request."""
    
    name: str = Field(..., min_length=1, max_length=100, description="Sender's name")
    email: EmailStr = Field(..., description="Sender's email address")
    subject: str = Field(..., min_length=1, max_length=200, description="Email subject")
    message: str = Field(..., min_length=1, max_length=2000, description="Email message")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "subject": "Question about pricing",
                "message": "I would like to know more about your Pro plan features."
            }
        }
    }


class ContactResponse(BaseModel):
    """Contact form submission response."""
    
    success: bool = Field(..., description="Whether the email was sent successfully")
    message: str = Field(..., description="Response message")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "success": True,
                "message": "Your message has been sent successfully. We'll get back to you soon!"
            }
        }
    }
