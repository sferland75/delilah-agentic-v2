from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from coordinator.coordinator import Coordinator
from coordinator.queue_manager import QueueManager
from database.service import DatabaseService
from database.models import AssessmentStatus

router = APIRouter()

# Request/Response Models

class AssessmentCreate(BaseModel):
    """Request model for creating a new assessment"""
    client_id: UUID
    therapist_id: UUID
    assessment_type: str
    metadata: Optional[Dict] = None

class AssessmentResponse(BaseModel):
    """Response model for assessment data"""
    id: UUID
    client_id: UUID
    therapist_id: UUID
    status: str
    assessment_type: str
    intake_date: datetime
    completion_date: Optional[datetime]
    current_stage: Optional[str]
    metadata: Optional[Dict]

class QueueStatus(BaseModel):
    """Response model for queue status"""
    intake: int
    processing: int
    analysis: int
    documentation: int
    completed: int
    error: int

# Dependencies

async def get_db():
    """Database dependency"""
    from database.config import DatabaseConfig
    config = DatabaseConfig()
    return DatabaseService(config.url)

async def get_coordinator():
    """Coordinator dependency"""
    # In practice, this would be a singleton managed by your application
    return Coordinator()

async def get_queue_manager(db: DatabaseService = Depends(get_db)):
    """Queue manager dependency"""
    return QueueManager(db)

# Routes

@router.post("/assessments", response_model=AssessmentResponse)
async def create_assessment(
    assessment: AssessmentCreate,
    db: DatabaseService = Depends(get_db),
    queue: QueueManager = Depends(get_queue_manager)
):
    """Create a new assessment"""
    # Create assessment record
    db_assessment = db.create_assessment(
        client_id=assessment.client_id,
        therapist_id=assessment.therapist_id,
        assessment_type=assessment.assessment_type,
        metadata=assessment.metadata
    )
    
    # Add to queue
    await queue.add_assessment(db_assessment.id)
    
    return db_assessment

@router.get("/assessments/{assessment_id}", response_model=AssessmentResponse)
async def get_assessment(
    assessment_id: UUID,
    db: DatabaseService = Depends(get_db)
):
    """Get assessment details"""
    assessment = db.get_assessment(assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment

@router.get("/assessments", response_model=List[AssessmentResponse])
async def list_assessments(
    status: Optional[str] = None,
    client_id: Optional[UUID] = None,
    therapist_id: Optional[UUID] = None,
    db: DatabaseService = Depends(get_db)
):
    """List assessments with optional filters"""
    if status:
        try:
            status_enum = AssessmentStatus(status)
            assessments = db.get_assessments_by_status(status_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status")
    elif client_id:
        assessments = db.get_client_assessments(client_id)
    elif therapist_id:
        assessments = db.get_therapist_assessments(therapist_id)
    else:
        # Get all assessments from the past month by default
        assessments = []  # TODO: Implement with date filter
    
    return assessments

@router.get("/queue/status", response_model=QueueStatus)
async def get_queue_status(
    queue: QueueManager = Depends(get_queue_manager)
):
    """Get current queue status"""
    return queue.get_queue_status()

@router.post("/assessments/{assessment_id}/cancel")
async def cancel_assessment(
    assessment_id: UUID,
    db: DatabaseService = Depends(get_db),
    coordinator: Coordinator = Depends(get_coordinator)
):
    """Cancel an in-progress assessment"""
    assessment = db.get_assessment(assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    if assessment.status == AssessmentStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Cannot cancel completed assessment")
    
    await coordinator.cancel_assessment(assessment_id)
    return {"status": "cancelled"}

@router.post("/queue/process")
async def trigger_queue_processing(
    queue: QueueManager = Depends(get_queue_manager)
):
    """Manually trigger queue processing"""
    await queue._process_queue()
    return {"status": "processing"}