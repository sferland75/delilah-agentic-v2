from datetime import datetime
from enum import Enum
from typing import Dict, Optional, List
from uuid import UUID
import logging
import traceback

from database.models import Assessment, AssessmentStatus
from database.service import DatabaseService

logger = logging.getLogger(__name__)

class ErrorSeverity(Enum):
    LOW = "low"          # Non-critical errors that don't affect workflow
    MEDIUM = "medium"    # Errors that need attention but don't block progress
    HIGH = "high"        # Critical errors that block assessment progress
    CRITICAL = "critical"  # System-level errors affecting multiple assessments

class ErrorCategory(Enum):
    DATA_VALIDATION = "data_validation"
    PROCESSING = "processing"
    AGENT_FAILURE = "agent_failure"
    DATABASE = "database"
    SYSTEM = "system"
    NETWORK = "network"

class ErrorHandler:
    """Handles error tracking, recovery, and notification"""
    
    def __init__(self, db_service: DatabaseService):
        self.db = db_service
        self.error_counts: Dict[str, int] = {}  # Track error frequencies
        self.recovery_attempts: Dict[UUID, int] = {}  # Track recovery attempts per assessment
        
    async def handle_error(self, 
                          assessment_id: UUID,
                          error: Exception,
                          category: ErrorCategory,
                          severity: ErrorSeverity,
                          context: Dict = None) -> None:
        """Handle an error occurrence"""
        error_id = UUID()
        timestamp = datetime.utcnow()
        
        # Log error details
        logger.error(f"Error in assessment {assessment_id}: {str(error)}")
        if context:
            logger.error(f"Context: {context}")
        logger.error(traceback.format_exc())
        
        # Update error counts
        error_key = f"{category.value}:{str(error.__class__.__name__)}"
        self.error_counts[error_key] = self.error_counts.get(error_key, 0) + 1
        
        # Store error in database
        self._store_error(
            error_id=error_id,
            assessment_id=assessment_id,
            error_message=str(error),
            category=category,
            severity=severity,
            context=context,
            timestamp=timestamp,
            stack_trace=traceback.format_exc()
        )
        
        # Update assessment status if severe
        if severity in [ErrorSeverity.HIGH, ErrorSeverity.CRITICAL]:
            self.db.update_assessment_status(
                assessment_id=assessment_id,
                status=AssessmentStatus.ERROR
            )
        
        # Attempt recovery if appropriate
        if severity != ErrorSeverity.CRITICAL:
            await self._attempt_recovery(assessment_id, error, category)
    
    async def _attempt_recovery(self,
                              assessment_id: UUID,
                              error: Exception,
                              category: ErrorCategory) -> bool:
        """Attempt to recover from an error"""
        # Check recovery attempts
        attempts = self.recovery_attempts.get(assessment_id, 0)
        if attempts >= 3:  # Max recovery attempts
            logger.warning(f"Max recovery attempts reached for assessment {assessment_id}")
            return False
        
        self.recovery_attempts[assessment_id] = attempts + 1
        
        try:
            if category == ErrorCategory.DATA_VALIDATION:
                return await self._recover_data_validation(assessment_id, error)
            elif category == ErrorCategory.PROCESSING:
                return await self._recover_processing(assessment_id, error)
            elif category == ErrorCategory.AGENT_FAILURE:
                return await self._recover_agent_failure(assessment_id, error)
            else:
                logger.warning(f"No recovery strategy for {category.value}")
                return False
                
        except Exception as recovery_error:
            logger.error(f"Recovery failed for assessment {assessment_id}: {str(recovery_error)}")
            return False
    
    async def _recover_data_validation(self,
                                     assessment_id: UUID,
                                     error: Exception) -> bool:
        """Recover from data validation errors"""
        assessment = self.db.get_assessment(assessment_id)
        if not assessment:
            return False
        
        # Check if error is due to missing required fields
        if "required field" in str(error).lower():
            # Attempt to fill with default values or mark for manual review
            current_stage = assessment.current_stage
            if current_stage:
                stage_data = assessment.stages[-1].output_data or {}
                fixed_data = self._apply_data_fixes(stage_data, str(error))
                if fixed_data:
                    # Update stage data with fixes
                    self.db.update_stage_status(
                        assessment.stages[-1].id,
                        "in_progress",
                        output_data=fixed_data
                    )
                    return True
        
        return False
    
    async def _recover_processing(self,
                                assessment_id: UUID,
                                error: Exception) -> bool:
        """Recover from processing errors"""
        assessment = self.db.get_assessment(assessment_id)
        if not assessment:
            return False
        
        if "timeout" in str(error).lower():
            # For timeout errors, retry with increased timeout
            current_stage = assessment.current_stage
            if current_stage:
                self.db.update_stage_status(
                    assessment.stages[-1].id,
                    "pending"  # Reset to pending for retry
                )
                return True
        
        return False
    
    async def _recover_agent_failure(self,
                                   assessment_id: UUID,
                                   error: Exception) -> bool:
        """Recover from agent failures"""
        assessment = self.db.get_assessment(assessment_id)
        if not assessment:
            return False
        
        # For agent failures, attempt to restart the agent or use backup
        current_stage = assessment.current_stage
        if current_stage:
            # Reset stage for retry
            self.db.update_stage_status(
                assessment.stages[-1].id,
                "pending"
            )
            return True
        
        return False
    
    def _store_error(self,
                     error_id: UUID,
                     assessment_id: UUID,
                     error_message: str,
                     category: ErrorCategory,
                     severity: ErrorSeverity,
                     context: Optional[Dict],
                     timestamp: datetime,
                     stack_trace: str) -> None:
        """Store error details in database"""
        # Implementation depends on your error storage schema
        pass
    
    def _apply_data_fixes(self, data: Dict, error_message: str) -> Optional[Dict]:
        """Apply fixes to data based on validation errors"""
        fixed_data = data.copy()
        
        # Example fixes for common issues
        if "required field" in error_message.lower():
            field = error_message.split("'")[1]
            if field in ["mobility_score", "daily_activities_score"]:
                fixed_data[field] = 0  # Default score
            elif field in ["notes", "observations"]:
                fixed_data[field] = "Pending manual review"
        
        return fixed_data if fixed_data != data else None
    
    def get_error_summary(self) -> Dict:
        """Get summary of recent errors"""
        return {
            "error_counts": self.error_counts.copy(),
            "recovery_attempts": len(self.recovery_attempts),
            "active_issues": sum(1 for x in self.error_counts.values() if x > 0)
        }
    
    def get_assessment_errors(self, assessment_id: UUID) -> List[Dict]:
        """Get error history for an assessment"""
        # Implementation depends on your error storage schema
        return []
    
    def clear_resolved_errors(self) -> None:
        """Clear tracking for resolved errors"""
        self.error_counts.clear()
        self.recovery_attempts.clear()
