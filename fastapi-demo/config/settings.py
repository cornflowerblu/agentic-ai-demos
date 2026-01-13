"""
Application Settings
Configuration management using Pydantic settings.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """
    Application settings.

    Values can be overridden via environment variables.
    """

    # Application
    APP_NAME: str = "FastAPI Demo"
    DEBUG: bool = True

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database (placeholder for future use)
    DATABASE_URL: Optional[str] = None

    # TODO: Rate limiting configuration
    # RATE_LIMIT_ENABLED: bool = True
    # RATE_LIMIT_DEFAULT: str = "100/minute"
    # RATE_LIMIT_STORAGE_URL: Optional[str] = None  # e.g., "redis://localhost:6379"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Global settings instance
settings = Settings()
