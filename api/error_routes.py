from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from coordinator.error_handler import ErrorHandler
from database.service import DatabaseService
from database.error_models import ErrorTracking, RecoveryAttempt

router = APIRouter(prefix="/errors", tags=["errors"])

class ErrorResponse(BaseModel):
    id: UUID
    assessment_id: UUID
    error_message: str
    category: str
    severity: str
    timestamp: str
    resolved_at: Optional[str] = None
    recovery_attempts: int

@router.get("/summary")
async def get_error_summary(
    error_handler: ErrorHandler = Depends()
):
    """Get summary of current error status"""
    return error_handler.get_error_summary()

@router.get("/recent", response_model=List[ErrorResponse])
async def get_recent_errors(
    limit: int = 10,
    db: DatabaseService = Depends()
):
    """Get most recent errors"""
    with db.get_session() as session:
        errors = session.query(ErrorTracking)\
            .order_by(ErrorTracking.timestamp.desc())\
            .limit(limit)\
            .all()
        
        return [{
            "id": error.id,
            "assessment_id": error.assessment_id,
            "error_message": error.error_message,
            "category": error.category.value,
            "severity": error.severity.value,
            "timestamp": error.timestamp.isoformat(),
            "resolved_at": error.resolved_at.isoformat() if error.resolved_at else None,
            "recovery_attempts": session.query(RecoveryAttempt)\
                .filter(RecoveryAttempt.error_id == error.id)\
                .count()
        } for error in errors]

@router.get("/assessment/{assessment_id}")
async def get_assessment_errors(
    assessment_id: UUID,
    error_handler: ErrorHandler = Depends()
):
    """Get error history for a specific assessment"""
    return error_handler.get_assessment_errors(assessment_id)

@router.post("/resolve/{error_id}")
async def resolve_error(
    error_id: UUID,
    resolution_notes: str,
    db: DatabaseService = Depends()
):
    """Mark an error as resolved"""
    with db.get_session() as session:
        error = session.query(ErrorTracking).get(error_id)
        if not error:
            raise HTTPException(status_code=404, detail="Error not found")
        
        error.resolved_at = datetime.utcnow()
        error.resolution_notes = resolution_notes
        session.commit()
        
        return {"status": "resolved"}

@router.post("/retry/{error_id}")
async def retry_recovery(
    error_id: UUID,
    error_handler: ErrorHandler = Depends(),
    db: DatabaseService = Depends()
):
    """Manually trigger recovery attempt"""
    with db.get_session() as session:
        error = session.query(ErrorTracking).get(error_id)
        if not error:
            raise HTTPException(status_code=404, detail="Error not found")
        
        # Attempt recovery
        assessment = error.assessment
        success = await error_handler._attempt_recovery(
            assessment.id,
            Exception(error.error_message),
            error.category
        )
        
        if success:
            return {"status": "recovery_successful"}
        else:
            raise HTTPException(
                status_code=500,
                detail="Recovery attempt failed"
            )