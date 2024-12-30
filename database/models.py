from datetime import datetime
from enum import Enum
from typing import Dict, Optional, List
from uuid import UUID

from sqlalchemy import (
    Column, DateTime, Enum as SQLEnum, 
    ForeignKey, Integer, JSON, String, Table
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class AssessmentStatus(str, Enum):
    INTAKE = "intake"
    PROCESSING = "processing"
    ANALYSIS = "analysis"
    DOCUMENTATION = "documentation"
    COMPLETED = "completed"
    ERROR = "error"

class Assessment(Base):
    """Main assessment record"""
    __tablename__ = "assessments"

    id = Column(PGUUID, primary_key=True)
    client_id = Column(PGUUID, ForeignKey('clients.id'), nullable=False)
    therapist_id = Column(PGUUID, ForeignKey('therapists.id'), nullable=False)
    status = Column(SQLEnum(AssessmentStatus), nullable=False)
    assessment_type = Column(String, nullable=False)
    intake_date = Column(DateTime, nullable=False)
    completion_date = Column(DateTime)
    current_stage = Column(String)
    metadata = Column(JSON)
    
    # Relationships
    client = relationship("Client", back_populates="assessments")
    therapist = relationship("Therapist", back_populates="assessments")
    stages = relationship("AssessmentStage", back_populates="assessment")
    documents = relationship("AssessmentDocument", back_populates="assessment")

class AssessmentStage(Base):
    """Individual stage in the assessment process"""
    __tablename__ = "assessment_stages"

    id = Column(PGUUID, primary_key=True)
    assessment_id = Column(PGUUID, ForeignKey('assessments.id'), nullable=False)
    stage_type = Column(String, nullable=False)  # e.g., "intake", "analysis"
    status = Column(String, nullable=False)  # "pending", "in_progress", "completed", "error"
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    agent_id = Column(PGUUID)  # ID of agent that processed this stage
    output_data = Column(JSON)  # Stage output/results
    error_message = Column(String)
    
    assessment = relationship("Assessment", back_populates="stages")

class AssessmentDocument(Base):
    """Documents associated with an assessment"""
    __tablename__ = "assessment_documents"

    id = Column(PGUUID, primary_key=True)
    assessment_id = Column(PGUUID, ForeignKey('assessments.id'), nullable=False)
    document_type = Column(String, nullable=False)  # e.g., "intake_form", "report"
    version = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)
    file_path = Column(String, nullable=False)
    metadata = Column(JSON)
    
    assessment = relationship("Assessment", back_populates="documents")

class Client(Base):
    """Client information"""
    __tablename__ = "clients"

    id = Column(PGUUID, primary_key=True)
    external_id = Column(String, unique=True)  # ID in external system
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    date_of_birth = Column(DateTime, nullable=False)
    contact_info = Column(JSON)  # Address, phone, email, etc.
    medical_record = Column(JSON)  # Basic medical history
    created_at = Column(DateTime, default=datetime.utcnow)
    
    assessments = relationship("Assessment", back_populates="client")

class Therapist(Base):
    """Therapist information"""
    __tablename__ = "therapists"

    id = Column(PGUUID, primary_key=True)
    external_id = Column(String, unique=True)  # ID in external system
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    credentials = Column(JSON)  # Licenses, certifications, etc.
    specialties = Column(JSON)  # Areas of expertise
    contact_info = Column(JSON)  # Professional contact information
    created_at = Column(DateTime, default=datetime.utcnow)
    
    assessments = relationship("Assessment", back_populates="therapist")