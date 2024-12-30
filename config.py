# app/config.py
from pydantic import BaseModel

class Settings(BaseModel):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/delilah"

settings = Settings()