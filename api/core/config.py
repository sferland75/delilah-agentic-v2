from typing import List
from pydantic_settings import BaseSettings
from pydantic import field_validator
import json
import os

class Settings(BaseSettings):
    # Basic settings
    PROJECT_NAME: str = "Delilah Agentic"
    VERSION: str = "0.1.0"
    SECRET_KEY: str
    DEBUG: bool = False  # default value
    
    # CORS settings
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Database settings
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_SERVER: str
    POSTGRES_PORT: str
    POSTGRES_DB: str
    DATABASE_URL: str | None = None

    @field_validator("DEBUG", mode="before")
    def validate_debug(cls, v):
        if isinstance(v, str):
            return v.lower() in ("true", "1", "yes", "t")
        return bool(v)

    @field_validator("CORS_ORIGINS", mode="before")
    def validate_cors_origins(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [v]
        return v

    @property
    def SQLALCHEMY_DATABASE_URL(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()