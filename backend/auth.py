from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from services.auth_service import AuthService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    auth_service = AuthService(db)
    return await auth_service.get_current_user(token)