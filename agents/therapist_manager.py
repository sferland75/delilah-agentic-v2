from typing import List, Optional, Dict
from uuid import UUID, uuid4
from datetime import datetime

from api.models.therapist import Therapist, TherapistCreate, TherapistUpdate

class TherapistManager:
    def __init__(self):
        self.therapists = {}
        self.assessment_history = {}  # therapist_id -> List[assessment_ids]

    async def create_therapist(self, therapist_data: TherapistCreate) -> Therapist:
        """Create a new therapist"""
        therapist_id = uuid4()
        now = datetime.utcnow()
        
        therapist = Therapist(
            id=therapist_id,
            created_at=now,
            updated_at=now,
            **therapist_data.model_dump()
        )
        
        self.therapists[therapist_id] = therapist
        self.assessment_history[therapist_id] = []
        return therapist

    async def get_therapist(self, therapist_id: UUID) -> Optional[Therapist]:
        """Get a therapist by ID"""
        return self.therapists.get(therapist_id)

    async def list_therapists(
        self,
        skip: int = 0,
        limit: int = 10,
        specialization: Optional[str] = None,
        state: Optional[str] = None
    ) -> List[Therapist]:
        """List therapists with optional filters"""
        therapists = list(self.therapists.values())
        
        if specialization:
            therapists = [
                t for t in therapists
                if any(s.name.lower() == specialization.lower() for s in t.specializations)
            ]
            
        if state:
            therapists = [
                t for t in therapists
                if t.license_state.lower() == state.lower()
            ]
            
        return therapists[skip:skip + limit]

    async def update_therapist(self, therapist_id: UUID, therapist_update: TherapistUpdate) -> Optional[Therapist]:
        """Update a therapist's information"""
        if therapist_id not in self.therapists:
            return None
            
        therapist = self.therapists[therapist_id]
        update_data = therapist_update.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(therapist, field, value)
            
        therapist.updated_at = datetime.utcnow()
        return therapist

    async def delete_therapist(self, therapist_id: UUID) -> None:
        """Soft delete a therapist"""
        if therapist_id not in self.therapists:
            raise ValueError("Therapist not found")
            
        therapist = self.therapists[therapist_id]
        therapist.is_active = False
        therapist.updated_at = datetime.utcnow()

    async def get_therapist_stats(self, therapist_id: UUID) -> Dict:
        """Get statistics for a therapist"""
        if therapist_id not in self.therapists:
            raise ValueError("Therapist not found")
            
        therapist = self.therapists[therapist_id]
        assessments = self.assessment_history.get(therapist_id, [])
        
        return {
            "total_assessments": len(assessments),
            "assessment_count": therapist.assessment_count,
            "rating": therapist.rating,
            "specializations": [s.name for s in therapist.specializations],
            "years_of_experience": therapist.years_of_experience
        }

    async def record_assessment(self, therapist_id: UUID, assessment_id: UUID) -> None:
        """Record a completed assessment for a therapist"""
        if therapist_id not in self.therapists:
            raise ValueError("Therapist not found")
            
        self.assessment_history[therapist_id].append(assessment_id)
        therapist = self.therapists[therapist_id]
        therapist.assessment_count += 1