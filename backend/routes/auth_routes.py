from datetime import timedelta
from typing import Dict
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
import logging
import json

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/login")
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    """Test login endpoint"""
    try:
        # Log request details
        body = await request.body()
        headers = dict(request.headers)
        logger.info("=== Login Request Details ===")
        logger.info(f"Headers: {json.dumps(headers, indent=2)}")
        logger.info(f"Body: {body.decode()}")
        logger.info(f"Form data - username: {form_data.username}")
        logger.info(f"Form data - password length: {len(form_data.password)}")
        
        # Return test response
        response = {
            "access_token": "test_token",
            "token_type": "bearer",
            "detail": "Test response - login endpoint reached"
        }
        
        logger.info(f"Returning response: {json.dumps(response, indent=2)}")
        return response
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": f"Login error: {str(e)}"}
        )