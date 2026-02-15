from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# Get the backend directory (parent of src)
BACKEND_DIR = Path(__file__).parent.parent
ENV_FILE = BACKEND_DIR / ".env"


class Settings(BaseSettings):
    database_url: str  # No default - must be provided in .env
    better_auth_secret: str
    debug: bool = False
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    allowed_hosts: str = "*"
    
    # Supabase Storage Settings (Free)
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    supabase_storage_bucket: str = "profile-photos"
    
    # Email Settings (SMTP)
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    from_email: str = ""
    support_email: str = "tara378581@gmail.com"
    
    # Push Notification Settings (VAPID)
    vapid_key_path: str = str(BACKEND_DIR / "vapid_keys.pem")

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_prefix="",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()

# Log database configuration on startup
import logging
logger = logging.getLogger(__name__)
logger.info(f"ENV_FILE path: {ENV_FILE}")
logger.info(f"ENV_FILE exists: {ENV_FILE.exists()}")
logger.info(f"Database URL configured: {'neon.tech' in settings.database_url if settings.database_url else 'NOT SET'}")
if settings.database_url:
    # Mask password
    db_url = settings.database_url
    if "@" in db_url:
        parts = db_url.split("@")
        masked = parts[0].split(":")[0] + ":****@" + parts[1]
    else:
        masked = db_url
    logger.info(f"Database: {masked}")
