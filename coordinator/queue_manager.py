from datetime import datetime, timedelta
from typing import Dict, List, Optional
from uuid import UUID
import asyncio
import logging

from database.models import AssessmentStatus
from database.service import DatabaseService

logger = logging.getLogger(__name__)

class QueueManager:
    """Manages assessment queue and processing priorities"""
    
    def __init__(self, db_service: DatabaseService, check_interval: int = 300):
        self.db = db_service
        self.check_interval = check_interval  # Default 5 minutes
        self.running = False
        self._schedule_task: Optional[asyncio.Task] = None
    
    async def start(self):
        """Start queue management"""
        self.running = True
        self._schedule_task = asyncio.create_task(self._schedule_loop())
        logger.info("Queue manager started")
    
    async def stop(self):
        """Stop queue management"""
        self.running = False
        if self._schedule_task:
            self._schedule_task.cancel()
            try:
                await self._schedule_task
            except asyncio.CancelledError:
                pass
        logger.info("Queue manager stopped")
    
    async def _schedule_loop(self):
        """Main scheduling loop"""
        while self.running:
            try:
                await self._process_queue()
                await asyncio.sleep(self.check_interval)
            except Exception as e:
                logger.error(f"Error in schedule loop: {str(e)}")
                await asyncio.sleep(60)  # Short delay on error
    
    async def _process_queue(self):
        """Process assessment queue"""
        # Get assessments by status
        intake = self.db.get_assessments_by_status(AssessmentStatus.INTAKE)
        processing = self.db.get_assessments_by_status(AssessmentStatus.PROCESSING)
        analysis = self.db.get_assessments_by_status(AssessmentStatus.ANALYSIS)
        documentation = self.db.get_assessments_by_status(AssessmentStatus.DOCUMENTATION)
        
        # Check for stalled assessments
        await self._check_stalled_assessments(processing + analysis + documentation)
        
        # Get therapist workload
        therapist_workload = self._get_therapist_workload()
        
        # Prioritize and schedule assessments
        prioritized = self._prioritize_assessments(intake, therapist_workload)
        
        # Update assessment statuses based on priority
        for assessment in prioritized:
            self.db.update_assessment_status(
                assessment.id,
                AssessmentStatus.PROCESSING,
                "queued_for_processing"
            )
    
    def _get_therapist_workload(self) -> Dict[UUID, int]:
        """Calculate current workload per therapist"""
        workload = {}
        active_statuses = [
            AssessmentStatus.PROCESSING,
            AssessmentStatus.ANALYSIS,
            AssessmentStatus.DOCUMENTATION
        ]
        
        for status in active_statuses:
            assessments = self.db.get_assessments_by_status(status)
            for assessment in assessments:
                workload[assessment.therapist_id] = workload.get(assessment.therapist_id, 0) + 1
        
        return workload
    
    async def _check_stalled_assessments(self, assessments: List):
        """Check for assessments that might be stalled"""
        stall_thresholds = {
            AssessmentStatus.PROCESSING: timedelta(hours=48),
            AssessmentStatus.ANALYSIS: timedelta(hours=24),
            AssessmentStatus.DOCUMENTATION: timedelta(hours=24)
        }
        
        now = datetime.utcnow()
        for assessment in assessments:
            last_update = assessment.stages[-1].started_at if assessment.stages else None
            if last_update:
                threshold = stall_thresholds.get(assessment.status)
                if threshold and (now - last_update) > threshold:
                    logger.warning(f"Assessment {assessment.id} may be stalled in {assessment.status}")
                    # TODO: Implement notification system for stalled assessments
    
    def _prioritize_assessments(self, assessments: List, therapist_workload: Dict[UUID, int]) -> List:
        """Prioritize assessments based on various factors"""
        # Calculate priority scores
        scored_assessments = []
        for assessment in assessments:
            score = 0
            
            # Factor 1: Therapist workload (lower is better)
            current_load = therapist_workload.get(assessment.therapist_id, 0)
            score -= current_load * 10
            
            # Factor 2: Age of assessment (older is higher priority)
            age_hours = (datetime.utcnow() - assessment.intake_date).total_seconds() / 3600
            score += min(age_hours, 168) / 8  # Cap at 1 week, scale down
            
            # Factor 3: Assessment type priority
            if assessment.assessment_type == "urgent":
                score += 100
            elif assessment.assessment_type == "initial":
                score += 50
            elif assessment.assessment_type == "followup":
                score += 25
            
            scored_assessments.append((score, assessment))
        
        # Sort by score (highest first) and return assessments
        scored_assessments.sort(reverse=True)
        return [a[1] for a in scored_assessments]
    
    async def add_assessment(self, assessment_id: UUID) -> None:
        """Add a new assessment to the queue"""
        assessment = self.db.get_assessment(assessment_id)
        if not assessment:
            raise ValueError(f"Assessment not found: {assessment_id}")
        
        if assessment.status != AssessmentStatus.INTAKE:
            raise ValueError(f"Assessment {assessment_id} is already in progress")
        
        logger.info(f"Added assessment {assessment_id} to queue")
        
        # Immediate queue processing if few items in system
        active_count = sum(
            len(self.db.get_assessments_by_status(status))
            for status in [
                AssessmentStatus.PROCESSING,
                AssessmentStatus.ANALYSIS,
                AssessmentStatus.DOCUMENTATION
            ]
        )
        
        if active_count < 3:  # If system is relatively idle
            await self._process_queue()
    
    def get_queue_status(self) -> Dict[str, int]:
        """Get current queue status"""
        return {
            status.value: len(self.db.get_assessments_by_status(status))
            for status in AssessmentStatus
        }