from datetime import datetime
from typing import Optional, Dict
from uuid import UUID

from sqlalchemy import Column, DateTime, Enum, ForeignKey, String, Text, Boolean
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import relationship

from .models import Base
from coordinator.error_handler import ErrorSeverity, ErrorCategory

class ErrorTracking(Base):
    """Track errors and their resolution"""
    __tablename__ = "error_tracking"
    
    id = Column(PGUUID, primary_key=True)
    assessment_id = Column(PGUUID, ForeignKey('assessments.id'), nullable=False)
    error_message = Column(String, nullable=False)
    category = Column(Enum(ErrorCategory), nullable=False)
    severity = Column(Enum(ErrorSeverity), nullable=False)
    context = Column(JSONB)
    stack_trace = Column(Text)
    timestamp = Column(DateTime, nullable=False)
    resolved_at = Column(DateTime)
    resolution_notes = Column(Text)
    
    # Relationships
    assessment = relationship("Assessment", back_populates="errors")
    recovery_attempts = relationship("RecoveryAttempt", back_populates="error")

class RecoveryAttempt(Base):
    """Track recovery attempts for errors"""
    __tablename__ = "recovery_attempts"
    
    id = Column(PGUUID, primary_key=True)
    error_id = Column(PGUUID, ForeignKey('error_tracking.id'), nullable=False)
    attempted_at = Column(DateTime, nullable=False)
    strategy_used = Column(String, nullable=False)
    successful = Column(Boolean, nullable=False)
    notes = Column(Text)
    
    # Relationships
    error = relationship("ErrorTracking", back_populates="recovery_attempts")