from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Dict, Any, Optional, List
from uuid import UUID, uuid4
import asyncio
import logging

from pydantic import BaseModel

logger = logging.getLogger(__name__)

class WorkflowStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ERROR = "error"
    CANCELLED = "cancelled"

class StageStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ERROR = "error"
    SKIPPED = "skipped"

class WorkflowStage(BaseModel):
    """Individual stage in a workflow"""
    id: str
    agent_type: str
    status: StageStatus = StageStatus.PENDING
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error: Optional[str] = None
    output: Optional[Dict[str, Any]] = None
    
    def start(self):
        """Mark stage as started"""
        self.status = StageStatus.IN_PROGRESS
        self.started_at = datetime.utcnow()
    
    def complete(self, output: Dict[str, Any]):
        """Mark stage as completed with output"""
        self.status = StageStatus.COMPLETED
        self.completed_at = datetime.utcnow()
        self.output = output
    
    def fail(self, error: str):
        """Mark stage as failed with error"""
        self.status = StageStatus.ERROR
        self.completed_at = datetime.utcnow()
        self.error = error

class AssessmentWorkflow(BaseModel):
    """Tracks the state of an in-home assessment workflow"""
    id: UUID = Field(default_factory=uuid4)
    client_id: UUID
    therapist_id: UUID
    assessment_type: str
    status: WorkflowStatus = WorkflowStatus.PENDING
    stages: List[WorkflowStage]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    current_stage_index: int = 0
    metadata: Dict[str, Any] = Field(default_factory=dict)
    error: Optional[str] = None
    
    def start(self):
        """Start the workflow"""
        self.status = WorkflowStatus.IN_PROGRESS
        self.started_at = datetime.utcnow()
    
    def complete(self):
        """Mark workflow as completed"""
        self.status = WorkflowStatus.COMPLETED
        self.completed_at = datetime.utcnow()
    
    def fail(self, error: str):
        """Mark workflow as failed"""
        self.status = WorkflowStatus.ERROR
        self.completed_at = datetime.utcnow()
        self.error = error
    
    def cancel(self):
        """Cancel the workflow"""
        self.status = WorkflowStatus.CANCELLED
        self.completed_at = datetime.utcnow()
    
    @property
    def current_stage(self) -> Optional[WorkflowStage]:
        """Get the current stage if workflow is in progress"""
        if 0 <= self.current_stage_index < len(self.stages):
            return self.stages[self.current_stage_index]
        return None
    
    @property
    def progress(self) -> float:
        """Calculate workflow progress percentage"""
        completed = sum(1 for stage in self.stages 
                       if stage.status == StageStatus.COMPLETED)
        return (completed / len(self.stages)) * 100

class WorkflowManager:
    """Manages multiple concurrent assessment workflows"""
    
    def __init__(self, max_concurrent: int = 10):
        self.max_concurrent = max_concurrent
        self.workflows: Dict[UUID, AssessmentWorkflow] = {}
        self.active_workflows: Dict[UUID, asyncio.Task] = {}
    
    def create_workflow(self, 
                       client_id: UUID,
                       therapist_id: UUID,
                       assessment_type: str,
                       metadata: Optional[Dict[str, Any]] = None) -> AssessmentWorkflow:
        """Create a new assessment workflow"""
        if len(self.active_workflows) >= self.max_concurrent:
            raise ValueError("Maximum concurrent workflows limit reached")
        
        # Define workflow stages
        stages = [
            WorkflowStage(
                id="assessment",
                agent_type="assessment"
            ),
            WorkflowStage(
                id="analysis",
                agent_type="analysis"
            ),
            WorkflowStage(
                id="documentation",
                agent_type="documentation"
            )
        ]
        
        # Create workflow
        workflow = AssessmentWorkflow(
            client_id=client_id,
            therapist_id=therapist_id,
            assessment_type=assessment_type,
            stages=stages,
            metadata=metadata or {}
        )
        
        self.workflows[workflow.id] = workflow
        return workflow
    
    async def start_workflow(self, workflow_id: UUID) -> None:
        """Start processing a workflow"""
        if workflow_id not in self.workflows:
            raise ValueError(f"Workflow not found: {workflow_id}")
        
        workflow = self.workflows[workflow_id]
        if workflow.status != WorkflowStatus.PENDING:
            raise ValueError(f"Workflow {workflow_id} is already {workflow.status.value}")
        
        # Start workflow
        workflow.start()
        task = asyncio.create_task(self._process_workflow(workflow))
        self.active_workflows[workflow_id] = task
    
    async def cancel_workflow(self, workflow_id: UUID) -> None:
        """Cancel an in-progress workflow"""
        if workflow_id in self.active_workflows:
            task = self.active_workflows[workflow_id]
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass
            
            workflow = self.workflows[workflow_id]
            workflow.cancel()
            
            del self.active_workflows[workflow_id]
    
    def get_workflow(self, workflow_id: UUID) -> Optional[AssessmentWorkflow]:
        """Get workflow by ID"""
        return self.workflows.get(workflow_id)
    
    def list_workflows(self, 
                      status: Optional[WorkflowStatus] = None,
                      client_id: Optional[UUID] = None,
                      therapist_id: Optional[UUID] = None) -> List[AssessmentWorkflow]:
        """List workflows with optional filters"""
        workflows = self.workflows.values()
        
        if status:
            workflows = [w for w in workflows if w.status == status]
        if client_id:
            workflows = [w for w in workflows if w.client_id == client_id]
        if therapist_id:
            workflows = [w for w in workflows if w.therapist_id == therapist_id]
            
        return list(workflows)
    
    async def _process_workflow(self, workflow: AssessmentWorkflow) -> None:
        """Process all stages of a workflow"""
        try:
            while workflow.current_stage_index < len(workflow.stages):
                stage = workflow.current_stage
                
                try:
                    # Start stage
                    stage.start()
                    
                    # TODO: Implement actual stage processing using agents
                    # For now, simulate processing
                    await asyncio.sleep(2)
                    
                    # Complete stage
                    stage.complete({"status": "success"})
                    workflow.current_stage_index += 1
                    
                except Exception as e:
                    stage.fail(str(e))
                    raise
            
            # All stages completed
            workflow.complete()
            
        except Exception as e:
            workflow.fail(str(e))
            logger.error(f"Workflow {workflow.id} failed: {str(e)}")
            
        finally:
            # Clean up
            if workflow.id in self.active_workflows:
                del self.active_workflows[workflow.id]
