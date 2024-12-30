from datetime import datetime
from typing import Dict, List, Optional, Any
from uuid import UUID

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.sql import select

from .models import (
    Base, Assessment, AssessmentStage, AssessmentDocument,
    Client, Therapist, AssessmentStatus
)

class DatabaseService:
    """Service layer for database operations"""
    
    def __init__(self, database_url: str):
        self.engine = create_engine(database_url)
        self.SessionLocal = sessionmaker(bind=self.engine)
        
    def create_tables(self):
        """Create all database tables"""
        Base.metadata.create_all(self.engine)
        
    def get_session(self) -> Session:
        """Get a new database session"""
        return self.SessionLocal()
    
    # Assessment Operations
    
    def create_assessment(self,
                         client_id: UUID,
                         therapist_id: UUID,
                         assessment_type: str,
                         metadata: Optional[Dict] = None) -> Assessment:
        """Create a new assessment record"""
        with self.get_session() as session:
            assessment = Assessment(
                id=UUID(),
                client_id=client_id,
                therapist_id=therapist_id,
                status=AssessmentStatus.INTAKE,
                assessment_type=assessment_type,
                intake_date=datetime.utcnow(),
                metadata=metadata or {}
            )
            
            # Create initial stage
            intake_stage = AssessmentStage(
                id=UUID(),
                assessment_id=assessment.id,
                stage_type="intake",
                status="pending"
            )
            
            session.add(assessment)
            session.add(intake_stage)
            session.commit()
            
            return assessment
    
    def get_assessment(self, assessment_id: UUID) -> Optional[Assessment]:
        """Get assessment by ID"""
        with self.get_session() as session:
            return session.get(Assessment, assessment_id)
    
    def update_assessment_status(self,
                               assessment_id: UUID,
                               status: AssessmentStatus,
                               stage: Optional[str] = None) -> None:
        """Update assessment status"""
        with self.get_session() as session:
            assessment = session.get(Assessment, assessment_id)
            if assessment:
                assessment.status = status
                if stage:
                    assessment.current_stage = stage
                if status == AssessmentStatus.COMPLETED:
                    assessment.completion_date = datetime.utcnow()
                session.commit()
    
    def create_assessment_stage(self,
                              assessment_id: UUID,
                              stage_type: str) -> AssessmentStage:
        """Create a new stage for an assessment"""
        with self.get_session() as session:
            stage = AssessmentStage(
                id=UUID(),
                assessment_id=assessment_id,
                stage_type=stage_type,
                status="pending"
            )
            session.add(stage)
            session.commit()
            return stage
    
    def update_stage_status(self,
                           stage_id: UUID,
                           status: str,
                           output_data: Optional[Dict] = None,
                           error_message: Optional[str] = None) -> None:
        """Update assessment stage status"""
        with self.get_session() as session:
            stage = session.get(AssessmentStage, stage_id)
            if stage:
                stage.status = status
                if status == "completed":
                    stage.completed_at = datetime.utcnow()
                    if output_data:
                        stage.output_data = output_data
                elif status == "error" and error_message:
                    stage.error_message = error_message
                session.commit()
    
    def add_assessment_document(self,
                              assessment_id: UUID,
                              document_type: str,
                              file_path: str,
                              metadata: Optional[Dict] = None) -> AssessmentDocument:
        """Add a document to an assessment"""
        with self.get_session() as session:
            document = AssessmentDocument(
                id=UUID(),
                assessment_id=assessment_id,
                document_type=document_type,
                version="1.0",
                created_at=datetime.utcnow(),
                file_path=file_path,
                metadata=metadata or {}
            )
            session.add(document)
            session.commit()
            return document
    
    # Query Operations
    
    def get_assessments_by_status(self, status: AssessmentStatus) -> List[Assessment]:
        """Get all assessments with a specific status"""
        with self.get_session() as session:
            return session.query(Assessment).filter_by(status=status).all()
    
    def get_client_assessments(self, client_id: UUID) -> List[Assessment]:
        """Get all assessments for a client"""
        with self.get_session() as session:
            return session.query(Assessment).filter_by(client_id=client_id).all()
    
    def get_therapist_assessments(self, therapist_id: UUID) -> List[Assessment]:
        """Get all assessments for a therapist"""
        with self.get_session() as session:
            return session.query(Assessment).filter_by(therapist_id=therapist_id).all()
    
    def get_weekly_assessment_stats(self) -> Dict[str, int]:
        """Get assessment statistics for the current week"""
        with self.get_session() as session:
            week_start = datetime.utcnow().replace(
                hour=0, minute=0, second=0, microsecond=0
            )
            while week_start.weekday() != 0:  # Monday
                week_start = week_start.replace(day=week_start.day - 1)
            
            total = session.query(Assessment)\
                .filter(Assessment.intake_date >= week_start)\
                .count()
            
            completed = session.query(Assessment)\
                .filter(Assessment.intake_date >= week_start)\
                .filter(Assessment.status == AssessmentStatus.COMPLETED)\
                .count()
                
            in_progress = session.query(Assessment)\
                .filter(Assessment.intake_date >= week_start)\
                .filter(Assessment.status.in_([
                    AssessmentStatus.INTAKE,
                    AssessmentStatus.PROCESSING,
                    AssessmentStatus.ANALYSIS,
                    AssessmentStatus.DOCUMENTATION
                ]))\
                .count()
            
            error = session.query(Assessment)\
                .filter(Assessment.intake_date >= week_start)\
                .filter(Assessment.status == AssessmentStatus.ERROR)\
                .count()
            
            return {
                "total": total,
                "completed": completed,
                "in_progress": in_progress,
                "error": error
            }
    
    # Client Operations
    
    def create_client(self,
                     external_id: str,
                     first_name: str,
                     last_name: str,
                     date_of_birth: datetime,
                     contact_info: Dict[str, Any],
                     medical_record: Optional[Dict] = None) -> Client:
        """Create a new client record"""
        with self.get_session() as session:
            client = Client(
                id=UUID(),
                external_id=external_id,
                first_name=first_name,
                last_name=last_name,
                date_of_birth=date_of_birth,
                contact_info=contact_info,
                medical_record=medical_record or {}
            )
            session.add(client)
            session.commit()
            return client
    
    def get_client(self, client_id: UUID) -> Optional[Client]:
        """Get client by ID"""
        with self.get_session() as session:
            return session.get(Client, client_id)
    
    # Therapist Operations
    
    def create_therapist(self,
                        external_id: str,
                        first_name: str,
                        last_name: str,
                        credentials: Dict[str, Any],
                        specialties: List[str],
                        contact_info: Dict[str, Any]) -> Therapist:
        """Create a new therapist record"""
        with self.get_session() as session:
            therapist = Therapist(
                id=UUID(),
                external_id=external_id,
                first_name=first_name,
                last_name=last_name,
                credentials=credentials,
                specialties=specialties,
                contact_info=contact_info
            )
            session.add(therapist)
            session.commit()
            return therapist
    
    def get_therapist(self, therapist_id: UUID) -> Optional[Therapist]:
        """Get therapist by ID"""
        with self.get_session() as session:
            return session.get(Therapist, therapist_id)