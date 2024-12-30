from datetime import datetime
from typing import Optional, List, Dict
from enum import Enum
from pydantic import BaseModel, Field, validator
from uuid import UUID

class ClientType(str, Enum):
    MVA = "MVA"
    LTD = "LTD"
    WSIB = "WSIB"
    OTHER = "OTHER"

class AssessmentType(str, Enum):
    IN_HOME = "IN_HOME"
    FCE = "FCE"
    CAT = "CAT"
    FAE = "FAE"
    OTHER = "OTHER"

class PainRating(BaseModel):
    minimum: int = Field(ge=0, le=10)
    maximum: int = Field(ge=0, le=10)
    usual: Optional[int] = Field(None, ge=0, le=10)

class PhysicalSymptom(BaseModel):
    symptom: str
    details: str
    pain_rating: Optional[PainRating]
    location: Optional[str]
    frequency: Optional[str]

class CognitiveSymptom(BaseModel):
    symptom: str
    details: str
    frequency: Optional[str]
    impact: Optional[str]

class EmotionalSymptom(BaseModel):
    symptom: str
    details: str
    frequency: Optional[str]
    severity: Optional[str]

class Tolerance(BaseModel):
    activity: str
    client_report: str
    therapist_observations: str
    duration: Optional[str]
    limitations: Optional[List[str]]

class RangeOfMotion(BaseModel):
    movement: str
    right: Optional[str]
    left: Optional[str]
    comments: Optional[str]

class ActivityLevel(str, Enum):
    INDEPENDENT = "I"
    PARTIAL_ASSISTANCE = "A"
    WITH_DEVICES = "D"
    UNABLE = "U"
    NOT_APPLICABLE = "NA"

class DailyActivity(BaseModel):
    activity: str
    pre_accident: ActivityLevel
    pre_accident_details: Optional[str]
    current: ActivityLevel
    current_details: str

class EnvironmentalAssessment(BaseModel):
    dwelling_type: str
    rooms: Dict[str, dict]
    accessibility_issues: Optional[List[str]]
    safety_concerns: Optional[List[str]]

class AttendantCareNeed(BaseModel):
    task: str
    observations: str
    minutes_per_week: int
    level: int = Field(ge=1, le=3)

class Contact(BaseModel):
    name: str
    role: str
    organization: Optional[str]
    contact_info: Optional[str]

class Assessment(BaseModel):
    id: UUID
    type: AssessmentType
    date_of_assessment: List[datetime]  # Can have multiple assessment dates
    date_of_report: datetime
    client_type: ClientType

    # Client Information
    client_name: str
    date_of_birth: datetime
    date_of_loss: datetime
    address: str
    phone: Optional[str]

    # Insurance/Legal Information
    claim_number: Optional[str]
    insurance_company: Optional[str]
    adjuster: Optional[Contact]
    lawyer: Optional[Contact]

    # Assessment Details
    therapist: Contact
    consent_obtained: bool
    documents_reviewed: List[str]
    medical_history: str
    mechanism_of_injury: str
    diagnosis_codes: List[str]
    current_medical_team: List[Contact]
    medications: List[Dict[str, str]]

    # Symptoms
    physical_symptoms: List[PhysicalSymptom]
    cognitive_symptoms: List[CognitiveSymptom]
    emotional_symptoms: List[EmotionalSymptom]

    # Functional Assessment
    tolerances: List[Tolerance]
    range_of_motion: List[RangeOfMotion]
    daily_activities: List[DailyActivity]
    typical_day: str
    environmental_assessment: EnvironmentalAssessment
    living_arrangements: str

    # Attendant Care
    attendant_care_needs: List[AttendantCareNeed]
    total_attendant_care_hours: float = 0
    monthly_attendant_care_benefit: float = 0

    # Recommendations
    recommendations: List[str]
    goals: List[str]

    class Config:
        schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "type": "IN_HOME",
                "date_of_assessment": ["2024-02-14", "2024-03-27"],
                "date_of_report": "2024-04-18",
                "client_type": "MVA",
                "client_name": "Michael Merkeley",
                "date_of_birth": "1977-10-17",
                "date_of_loss": "2023-08-23",
                "address": "11069 Rowena Road, Iroquois, ON K0C 1K0",
                "phone": "NA",
                "claim_number": "A000924496-01",
                "insurance_company": "CAA Insurance Company"
            }
        }

    @validator('physical_symptoms')
    def validate_pain_ratings(cls, v):
        for symptom in v:
            if symptom.pain_rating:
                if symptom.pain_rating.maximum < symptom.pain_rating.minimum:
                    raise ValueError("Maximum pain rating cannot be less than minimum")
                if symptom.pain_rating.usual:
                    if (symptom.pain_rating.usual < symptom.pain_rating.minimum or 
                        symptom.pain_rating.usual > symptom.pain_rating.maximum):
                        raise ValueError("Usual pain rating must be between minimum and maximum")
        return v

    @validator('attendant_care_needs')
    def calculate_total_care_hours(cls, v):
        total_minutes = sum(need.minutes_per_week for need in v)
        return total_minutes / 60  # Convert to hours

    @validator('monthly_attendant_care_benefit')
    def calculate_monthly_benefit(cls, v, values):
        if 'attendant_care_needs' not in values:
            return 0
        
        total_minutes = sum(need.minutes_per_week for need in values['attendant_care_needs'])
        hourly_rates = {1: 14.90, 2: 14.90, 3: 22.36}  # Current Ontario rates
        monthly_total = 0
        
        for need in values['attendant_care_needs']:
            weekly_hours = need.minutes_per_week / 60
            monthly_hours = weekly_hours * 4.33  # Average weeks per month
            monthly_total += monthly_hours * hourly_rates[need.level]
            
        return min(monthly_total, 6000)  # Cap at $6,000 as per SABS