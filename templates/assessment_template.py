from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, Field

class DemographicInfo(BaseModel):
    """Client demographic and referral information"""
    client_name: str
    date_of_loss: Optional[datetime]
    address: str
    date_of_birth: datetime
    telephone: str
    lawyer: Optional[str]
    law_firm: Optional[str]
    adjuster: Optional[str]
    insurer: Optional[str]
    claim_number: Optional[str]
    assessment_date: datetime
    report_date: Optional[datetime] = None

class DocumentationReviewed(BaseModel):
    """Tracks reviewed documentation"""
    medical_docs: List[str] = Field(default_factory=list)
    legal_docs: List[str] = Field(default_factory=list)
    other_docs: List[str] = Field(default_factory=list)
    notes: Optional[str] = None

class MedicalCondition(BaseModel):
    """Pre-accident medical condition"""
    condition: str
    treatment_history: str
    functional_impact: str
    current_status: str

class Injury(BaseModel):
    """Injury details"""
    injury: str
    diagnosis_date: Optional[datetime]
    treating_professional: str
    current_status: str

class MechanismOfInjury(BaseModel):
    """Details about how injury occurred"""
    impact_description: str
    body_position: str
    immediate_symptoms: str
    initial_medical_response: str
    symptom_development: str

class ProviderInfo(BaseModel):
    """Medical/rehabilitation provider information"""
    provider_type: str
    name: str
    frequency: str
    last_visit: Optional[datetime]
    outcomes: str
    next_visit: Optional[datetime]

class Medication(BaseModel):
    """Medication details"""
    name: str
    dosage: str
    frequency: str
    purpose: str
    side_effects: Optional[str]
    effectiveness: str

class Symptom(BaseModel):
    """Symptom assessment"""
    name: str
    description: str
    frequency: str
    intensity: Optional[int] = Field(None, ge=0, le=10)
    functional_impact: str
    aggravating_factors: Optional[List[str]] = None
    alleviating_factors: Optional[List[str]] = None
    management_strategies: Optional[List[str]] = None

class FunctionalActivity(BaseModel):
    """Functional activity assessment"""
    activity: str
    observations: str
    limitations: Optional[str] = None
    recommendations: Optional[str] = None

class RangeOfMotion(BaseModel):
    """Range of motion assessment"""
    movement: str
    right: str = "WFL"
    left: Optional[str] = "WFL"
    comments: Optional[str] = None

class EnvironmentalAssessment(BaseModel):
    """Home environment assessment"""
    dwelling_type: str
    rooms: Dict[str, Dict[str, str]]  # room_type -> {qty, location, floor_covering}
    driveway: Optional[str]
    yard: Optional[str]
    accessibility_notes: Optional[str]

class ADLActivity(BaseModel):
    """Activities of daily living assessment"""
    activity: str
    pre_accident: str
    current_status: str
    required_assistance: str
    equipment_needs: Optional[str]
    recommendations: Optional[str]

class AttendantCareTask(BaseModel):
    """Attendant care needs assessment"""
    task: str
    current_status: str
    required_assistance: str
    time_allocation: str
    clinical_rationale: str

class Recommendation(BaseModel):
    """Treatment/intervention recommendation"""
    recommendation: str
    clinical_rationale: str
    implementation_steps: List[str]
    expected_outcomes: str
    cost_estimate: Optional[float]

class ClosingSummary(BaseModel):
    """Assessment closing summary"""
    key_findings: List[str]
    functional_impact: str
    treatment_rationale: str
    reassessment_timeline: str
    progress_indicators: List[str]
    outcome_measures: List[str]
    communication_plan: str

class AssessmentTemplate(BaseModel):
    """Complete in-home assessment template"""
    id: UUID
    demographics: DemographicInfo
    documentation: DocumentationReviewed
    pre_accident_conditions: List[MedicalCondition] = Field(default_factory=list)
    mechanism_of_injury: MechanismOfInjury
    injuries: List[Injury] = Field(default_factory=list)
    providers: List[ProviderInfo] = Field(default_factory=list)
    medications: List[Medication] = Field(default_factory=list)
    physical_symptoms: List[Symptom] = Field(default_factory=list)
    cognitive_symptoms: List[Symptom] = Field(default_factory=list)
    emotional_symptoms: List[Symptom] = Field(default_factory=list)
    functional_activities: List[FunctionalActivity] = Field(default_factory=list)
    range_of_motion: List[RangeOfMotion] = Field(default_factory=list)
    environment: EnvironmentalAssessment
    adl_activities: List[ADLActivity] = Field(default_factory=list)
    home_management: List[ADLActivity] = Field(default_factory=list)
    attendant_care: List[AttendantCareTask] = Field(default_factory=list)
    immediate_recommendations: List[Recommendation] = Field(default_factory=list)
    short_term_recommendations: List[Recommendation] = Field(default_factory=list)
    long_term_recommendations: List[Recommendation] = Field(default_factory=list)
    closing_summary: ClosingSummary
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "draft"
    version: str = "1.0"