from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import SecretStr
from typing import Optional
import sys

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Server
    NODE_ENV: str = "development"
    PORT: int = 8000

    # Groq
    GROQ_API_KEY: Optional[SecretStr] = None

    # Supabase
    SUPABASE_URL: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[SecretStr] = None

    # Meta WhatsApp API
    META_ACCESS_TOKEN: Optional[SecretStr] = None
    META_PHONE_NUMBER_ID: Optional[str] = None
    META_WEBHOOK_VERIFY_TOKEN: Optional[str] = None

    # Resend Email
    RESEND_API_KEY: Optional[SecretStr] = None

    # Twilio WhatsApp Fallback
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[SecretStr] = None
    TWILIO_WHATSAPP_NUMBER: Optional[str] = None

    # Security
    SECRET_KEY: str = "dev-secret-change-me"
    ENCRYPTION_KEY: str = "0" * 64
    
    # Authority Portal Auth
    AUTHORITY_ACCESS_TOKEN: str = "mehfooz-admin-2024"
    AUTHORITY_MASTER_PASSWORD: str = "mehfooz-admin-2024"

    # Monitoring
    SENTRY_DSN: Optional[str] = None

try:
    settings = Settings()
    
    # Validation / Sanitization
    if settings.GROQ_API_KEY and settings.GROQ_API_KEY.get_secret_value() == "placeholder":
        settings.GROQ_API_KEY = None
    if settings.SUPABASE_URL and "placeholder" in settings.SUPABASE_URL:
        settings.SUPABASE_URL = None
    if settings.SUPABASE_SERVICE_ROLE_KEY and settings.SUPABASE_SERVICE_ROLE_KEY.get_secret_value() == "placeholder":
        settings.SUPABASE_SERVICE_ROLE_KEY = None
        
    print(f"OK Config loaded — Environment: {settings.NODE_ENV}")
except Exception as e:
    print(f"Error Invalid environment variables: {e}")
    sys.exit(1)
