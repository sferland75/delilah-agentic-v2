from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Dict, Optional, Any, List
from uuid import UUID, uuid4
import asyncio
from pydantic import BaseModel, Field, validator

class AgentType(Enum):
    ASSESSMENT = "assessment"
    ANALYSIS = "analysis"
    DOCUMENTATION = "documentation"
    REPORT = "report"
    CLIENT_MANAGER = "client_manager"
    THERAPIST_MANAGER = "therapist_manager"
    USER_MANAGER = "user_manager"
    EXPORT_MANAGER = "export_manager"

class AgentStatus(Enum):
    IDLE = "idle"
    BUSY = "busy"
    ERROR = "error"
    DISABLED = "disabled"

@dataclass
class AgentContext:
    """Context information for agent execution"""
    session_id: UUID
    user_id: Optional[UUID] = None
    therapist_id: Optional[UUID] = None
    client_id: Optional[UUID] = None
    metadata: Dict[str, Any] = None

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

class AgentConfig(BaseModel):
    """Configuration settings for an agent instance"""
    max_concurrent_tasks: int = Field(default=1, ge=1, le=100)
    timeout_seconds: int = Field(default=300, ge=30, le=3600)
    retry_attempts: int = Field(default=3, ge=0, le=10)
    custom_settings: Optional[Dict[str, Any]] = None

    class Config:
        extra = "forbid"

    @validator("custom_settings")
    def validate_custom_settings(cls, v):
        if v is not None:
            reserved_keys = {"max_concurrent_tasks", "timeout_seconds", "retry_attempts"}
            if any(key in v for key in reserved_keys):
                raise ValueError(f"Custom settings cannot contain reserved keys: {reserved_keys}")
        return v

class BaseAgent:
    """Base class for all agents with common functionality and validation"""
    
    def __init__(self, agent_type: AgentType, name: str, config: Optional[AgentConfig] = None):
        self.id = uuid4()
        self.type = agent_type
        self.name = self._validate_name(name)
        self.status = AgentStatus.IDLE
        self.config = config or AgentConfig()
        self.created_at = datetime.utcnow()
        self.last_active = None
        self.error_count = 0
        self.active_contexts: Dict[UUID, AgentContext] = {}
        self.message_queue: asyncio.Queue = asyncio.Queue()

    @staticmethod
    def _validate_name(name: str) -> str:
        """Validate agent name format"""
        if not name or len(name) < 3 or len(name) > 50:
            raise ValueError("Agent name must be between 3 and 50 characters")
        if not name.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Agent name must contain only alphanumeric characters, underscores, and hyphens")
        return name

    def validate_context(self, context: AgentContext) -> None:
        """Validate agent context based on agent type requirements"""
        if self.type == AgentType.ASSESSMENT:
            if not context.therapist_id or not context.client_id:
                raise ValueError("Assessment agent requires both therapist_id and client_id")
        elif self.type == AgentType.CLIENT_MANAGER:
            if not context.user_id:
                raise ValueError("Client manager agent requires user_id")
        # Add more type-specific validations as needed

    async def start_session(self, context: AgentContext) -> UUID:
        """Start a new agent session with validation"""
        if self.status == AgentStatus.DISABLED:
            raise ValueError("Agent is disabled")
        
        if len(self.active_contexts) >= self.config.max_concurrent_tasks:
            raise ValueError("Maximum concurrent tasks limit reached")

        self.validate_context(context)
        self.active_contexts[context.session_id] = context
        self.last_active = datetime.utcnow()
        
        await self.message_queue.put({
            "type": "session_started",
            "session_id": context.session_id,
            "agent_id": self.id,
            "agent_type": self.type.value
        })
        
        return context.session_id

    async def end_session(self, session_id: UUID) -> None:
        """End an agent session with cleanup"""
        if session_id in self.active_contexts:
            del self.active_contexts[session_id]
            await self.message_queue.put({
                "type": "session_ended",
                "session_id": session_id,
                "agent_id": self.id
            })

    def update_status(self, status: AgentStatus) -> None:
        """Update agent status with validation"""
        if status == AgentStatus.DISABLED and self.active_contexts:
            raise ValueError("Cannot disable agent with active contexts")
        self.status = status
        self.last_active = datetime.utcnow()

    async def handle_error(self, error: Exception, context: AgentContext) -> None:
        """Handle and log agent errors"""
        self.error_count += 1
        if self.error_count >= self.config.retry_attempts:
            self.update_status(AgentStatus.ERROR)
        
        await self.message_queue.put({
            "type": "agent_error",
            "agent_id": self.id,
            "session_id": context.session_id,
            "error": str(error),
            "error_count": self.error_count
        })