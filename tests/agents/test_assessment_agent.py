import pytest
from datetime import datetime
from uuid import uuid4
from backend.models.assessment import (
    Assessment, PhysicalSymptom, CognitiveSymptom, EmotionalSymptom,
    Tolerance, DailyActivity, ActivityLevel, PainRating,
    EnvironmentalAssessment, AttendantCareNeed, Contact, AssessmentType,
    ClientType
)
from agents.assessment_agent import AssessmentAgent
from agents.base import AgentContext

@pytest.fixture
def sample_assessment():
    return Assessment(
        id=uuid4(),
        type=AssessmentType.IN_HOME,
        date_of_assessment=[datetime.now()],
        date_of_report=datetime.now(),
        client_type=ClientType.MVA,
        client_name="Test Client",
        date_of_birth=datetime.now(),
        date_of_loss=datetime.now(),
        address="123 Test St",
        consent_obtained=True,
        documents_reviewed=["Test Doc"],
        medical_history="Test History",
        mechanism_of_injury="Test MOI",
        diagnosis_codes=["Test Code"],
        therapist=Contact(
            name="Test Therapist",
            role="OT"
        ),
        physical_symptoms=[
            PhysicalSymptom(
                symptom="Back Pain",
                details="Constant pain",
                pain_rating=PainRating(
                    minimum=5,
                    maximum=8,
                    usual=6
                )
            )
        ],
        cognitive_symptoms=[
            CognitiveSymptom(
                symptom="Memory Issues",
                details="Short-term memory affected",
                impact="Significant impact on daily function"
            )
        ],
        emotional_symptoms=[
            EmotionalSymptom(
                symptom="Depression",
                details="Feeling hopeless",
                severity="Severe"
            )
        ],
        tolerances=[
            Tolerance(
                activity="Walking",
                client_report="Limited to 10 minutes",
                therapist_observations="Observed difficulty after 8 minutes",
                duration="10 minutes"
            )
        ],
        daily_activities=[
            DailyActivity(
                activity="Meal Preparation",
                pre_accident=ActivityLevel.INDEPENDENT,
                pre_accident_details="No issues",
                current=ActivityLevel.PARTIAL_ASSISTANCE,
                current_details="Requires help with complex meals"
            )
        ],
        typical_day="Test typical day",
        environmental_assessment=EnvironmentalAssessment(
            dwelling_type="House",
            rooms={},
            accessibility_issues=["Stairs difficult"],
            safety_concerns=["Poor lighting"]
        ),
        living_arrangements="Lives alone",
        attendant_care_needs=[
            AttendantCareNeed(
                task="Meal Prep",
                observations="Requires assistance",
                minutes_per_week=120,
                level=1
            )
        ],
        recommendations=["OT treatment"],
        goals=["Improve independence"]
    )

@pytest.fixture
def assessment_agent():
    return AssessmentAgent()

@pytest.mark.asyncio
async def test_validate_assessment_valid(assessment_agent, sample_assessment):
    errors = await assessment_agent.validate_assessment(sample_assessment)
    assert len(errors) == 0

@pytest.mark.asyncio
async def test_validate_assessment_invalid_pain_rating(assessment_agent, sample_assessment):
    # Set invalid pain rating where max < min
    sample_assessment.physical_symptoms[0].pain_rating.maximum = 4
    sample_assessment.physical_symptoms[0].pain_rating.minimum = 5
    
    errors = await assessment_agent.validate_assessment(sample_assessment)
    assert len(errors) > 0
    assert any("pain rating" in error.lower() for error in errors)

@pytest.mark.asyncio
async def test_process_assessment(assessment_agent, sample_assessment):
    context = AgentContext(
        session_id=uuid4(),
        user_id=uuid4()
    )
    
    result = await assessment_agent.process_assessment(sample_assessment, context)
    
    assert result["status"] == "processed"
    assert result["validation_status"] == "passed"
    assert "functional_changes" in result
    assert "risk_factors" in result
    assert "metrics" in result
    assert "recommendations" in result

@pytest.mark.asyncio
async def test_risk_factor_identification(assessment_agent, sample_assessment):
    risk_factors = assessment_agent._identify_risk_factors(sample_assessment)
    
    # Should identify psychological risk from depression symptom
    assert any(
        risk["type"] == "psychological" and risk["severity"] == "high"
        for risk in risk_factors
    )
    
    # Should identify environmental risk from accessibility issues
    assert any(
        risk["type"] == "environmental"
        for risk in risk_factors
    )

@pytest.mark.asyncio
async def test_analyze_functional_changes(assessment_agent, sample_assessment):
    changes = assessment_agent._analyze_functional_changes(sample_assessment)
    
    assert "adl_changes" in changes
    assert len(changes["adl_changes"]) > 0
    assert changes["adl_changes"][0]["activity"] == "Meal Preparation"
    
    assert "mobility_changes" in changes
    assert len(changes["mobility_changes"]) > 0
    assert "Walking" in changes["mobility_changes"][0]["activity"]

@pytest.mark.asyncio
async def test_calculate_metrics(assessment_agent, sample_assessment):
    metrics = assessment_agent._calculate_metrics(sample_assessment)
    
    assert "functional_status" in metrics
    assert metrics["functional_status"]["requires_assistance"] == 1
    
    assert "symptom_counts" in metrics
    assert metrics["symptom_counts"]["physical"] == 1
    assert metrics["symptom_counts"]["cognitive"] == 1
    assert metrics["symptom_counts"]["emotional"] == 1
    
    assert "attendant_care" in metrics
    assert metrics["attendant_care"]["care_levels"][1] == 1

@pytest.mark.asyncio
async def test_generate_recommendations(assessment_agent, sample_assessment):
    changes = assessment_agent._analyze_functional_changes(sample_assessment)
    risk_factors = assessment_agent._identify_risk_factors(sample_assessment)
    
    recommendations = assessment_agent._generate_recommendations(
        sample_assessment,
        changes,
        risk_factors
    )
    
    assert len(recommendations) > 0
    assert all(
        "type" in rec and "priority" in rec and "recommendation" in rec
        for rec in recommendations
    )

@pytest.mark.asyncio
async def test_process_assessment_with_errors(assessment_agent, sample_assessment):
    # Remove required cognitive symptoms
    sample_assessment.cognitive_symptoms = []
    
    context = AgentContext(
        session_id=uuid4(),
        user_id=uuid4()
    )
    
    with pytest.raises(ValueError) as exc_info:
        await assessment_agent.process_assessment(sample_assessment, context)
    
    assert "validation failed" in str(exc_info.value)

@pytest.mark.asyncio
async def test_metrics_update(assessment_agent, sample_assessment):
    context = AgentContext(
        session_id=uuid4(),
        user_id=uuid4()
    )
    
    result = await assessment_agent.process_assessment(sample_assessment, context)
    
    # Check that a metric update message was queued
    messages = []
    while not assessment_agent.message_queue.empty():
        messages.append(await assessment_agent.message_queue.get())
    
    assert any(
        msg["type"] == "metric_update" and 
        msg["metric"] == "assessment_completed"
        for msg in messages
    )