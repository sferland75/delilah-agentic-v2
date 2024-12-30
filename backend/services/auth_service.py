from typing import Optional
from sqlalchemy.orm import Session
from database.session import SessionLocal
from models.user import User, UserRole
from utils.security import verify_password
import logging
import traceback
from sqlalchemy import text

logger = logging.getLogger(__name__)

class AuthService:
    @staticmethod
    def authenticate(email: str, password: str) -> Optional[User]:
        """Authenticate user and return user object if successful"""
        logger.info(f"=== Starting Authentication for {email} ===")
        
        db = SessionLocal()
        try:
            # First try raw SQL to debug
            stmt = text("SELECT * FROM users WHERE email = :email")
            result = db.execute(stmt, {"email": email})
            raw_user = result.first()
            logger.info(f"Raw SQL user lookup result: {raw_user is not None}")
            if raw_user:
                logger.info(f"Raw user data: id={raw_user.id}, email={raw_user.email}, role={raw_user.role}")

            # Now try ORM query
            logger.info("Attempting ORM query...")
            user = db.query(User).filter(User.email == email).first()
            
            if not user:
                logger.warning(f"No user found with email: {email}")
                return None
            
            logger.info(f"Found user: id={user.id}, email={user.email}, role={user.role}")
            logger.info(f"Stored hash length: {len(user.hashed_password)}")
            
            # Verify password
            logger.info("Verifying password...")
            is_valid = verify_password(password, user.hashed_password)
            logger.info(f"Password verification result: {is_valid}")
            
            if not is_valid:
                logger.warning(f"Invalid password for user: {email}")
                return None
            
            logger.info("Authentication successful")
            return user
            
        except Exception as e:
            logger.error("=== Authentication Error ===")
            logger.error(f"Error type: {type(e).__name__}")
            logger.error(f"Error message: {str(e)}")
            logger.error(f"Traceback:\n{traceback.format_exc()}")
            raise
        finally:
            db.close()
            logger.info("=== Authentication Complete ===")

    @staticmethod
    def get_user_by_email(email: str) -> Optional[User]:
        """Get user by email"""
        logger.info(f"Looking up user by email: {email}")
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.email == email).first()
            logger.info(f"User lookup result: {user is not None}")
            return user
        except Exception as e:
            logger.error(f"Error in get_user_by_email: {str(e)}")
            logger.error(traceback.format_exc())
            raise
        finally:
            db.close()