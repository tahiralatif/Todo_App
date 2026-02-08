from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    better_auth_secret: str
    gemini_api_key: str
    debug: bool = False
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001"
    allowed_hosts: str = "*"

    # Supabase Storage Settings (Free)
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    supabase_storage_bucket: str = "profile-photos"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()
