"""Email service for sending contact form emails."""

import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from src.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails."""
    
    def __init__(self):
        self.smtp_host = getattr(settings, 'smtp_host', 'smtp.gmail.com')
        self.smtp_port = getattr(settings, 'smtp_port', 587)
        self.smtp_user = getattr(settings, 'smtp_user', '')
        self.smtp_password = getattr(settings, 'smtp_password', '')
        self.from_email = getattr(settings, 'from_email', self.smtp_user)
        self.to_email = getattr(settings, 'support_email', 'tara378581@gmail.com')
    
    async def send_contact_email(
        self,
        name: str,
        email: str,
        subject: str,
        message: str
    ) -> bool:
        """
        Send contact form email to support.
        
        Args:
            name: Sender's name
            email: Sender's email
            subject: Email subject
            message: Email message
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"[Execute Support] {subject}"
            msg['From'] = self.from_email
            msg['To'] = self.to_email
            msg['Reply-To'] = email
            
            # Create HTML and plain text versions
            text_content = f"""
Contact Form Submission

Name: {name}
Email: {email}
Subject: {subject}

Message:
{message}

---
This email was sent from the Execute contact form.
Reply to this email to respond directly to {email}.
"""
            
            html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
        .content {{ background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }}
        .field {{ margin-bottom: 20px; }}
        .label {{ font-weight: bold; color: #14B8A6; margin-bottom: 5px; }}
        .value {{ background: white; padding: 10px; border-radius: 4px; border-left: 3px solid #14B8A6; }}
        .message-box {{ background: white; padding: 15px; border-radius: 4px; border: 1px solid #e0e0e0; min-height: 100px; }}
        .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin: 0;">📧 New Contact Form Submission</h2>
        </div>
        <div class="content">
            <div class="field">
                <div class="label">👤 Name:</div>
                <div class="value">{name}</div>
            </div>
            
            <div class="field">
                <div class="label">📧 Email:</div>
                <div class="value"><a href="mailto:{email}">{email}</a></div>
            </div>
            
            <div class="field">
                <div class="label">📝 Subject:</div>
                <div class="value">{subject}</div>
            </div>
            
            <div class="field">
                <div class="label">💬 Message:</div>
                <div class="message-box">{message.replace(chr(10), '<br>')}</div>
            </div>
            
            <div class="footer">
                <p>This email was sent from the Execute contact form.</p>
                <p>Reply to this email to respond directly to the sender.</p>
            </div>
        </div>
    </div>
</body>
</html>
"""
            
            # Attach both versions
            part1 = MIMEText(text_content, 'plain')
            part2 = MIMEText(html_content, 'html')
            msg.attach(part1)
            msg.attach(part2)
            
            # Send email
            if not self.smtp_user or not self.smtp_password:
                logger.warning("SMTP credentials not configured. Email not sent.")
                logger.info(f"Would have sent email to {self.to_email}:")
                logger.info(f"From: {name} <{email}>")
                logger.info(f"Subject: {subject}")
                logger.info(f"Message: {message}")
                # Return True for development (email logged but not sent)
                return True
            
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Contact email sent successfully to {self.to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send contact email: {e}")
            return False


# Singleton instance
_email_service: Optional[EmailService] = None


def get_email_service() -> EmailService:
    """Get or create email service instance."""
    global _email_service
    if _email_service is None:
        _email_service = EmailService()
    return _email_service
