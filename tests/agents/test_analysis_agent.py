import pytest
from datetime import datetime
from uuid import uuid4
from agents.analysis_agent import AnalysisAgent
from agents.base import AgentContext

@pytest.fixture
def analysis_agent():
    return AnalysisAgent()

@pytest.fixture
def sample_assessment_data():
    return {
        "id": uuid4(),
        "client_id": uuid4(),
        "functional_changes": {
            "adl_changes": [
                {
                    "activity": "meal preparation",
                    "pre_status": "independent",
                    "current_status": "requires_assistance"
                },
                {
                    "activity": "mobility outdoors",
                    "pre_status": "independent",
                    "current_status": "unable"
                }
            ],
            "mobility_changes": [
                {
                    "activity": "walking",
                    "details": "Limited to 10 minutes",
                    "observations": "Significant difficulty observed"
                }
            ]
        },
        "risk_factors": [
            {
                "type": "physical",
                "severity": "high",
                "details": "Severe mobility limitations"
            },
            {
                "type": "environmental",
                "severity": "moderate",
                "details": "Stairs in home"
            }
        ],
        "metrics": {
            "functional_status": {
                "independent": 0.4,
                "requires_assistance": 0.4,
                "unable": 0.2
            }
        }
    }

@pytest.mark.asyncio
async def test_analyze_assessment(analysis_agent, sample_assessment_data):
    context = AgentContext(
        session_id=uuid4(),
        user_id=uuid4()
    )
    
    result = await analysis_agent.analyze_assessment(sample_assessment_data, context)
    
    assert result.client_id == sample_assessment_data["client_id"]
    assert result.assessment_id == sample_assessment_data["id"]
    assert isinstance(result.risk_score, float)
    assert result.priority_level in ["high", "moderate", "low"]
    assert "functional_impact" in result.insights
    assert len(result.recommendations) > 0

@pytest.mark.asyncio
async def test_risk_score_calculation(analysis_agent, sample_assessment_data):
    risk_score = analysis_agent._calculate_risk_score(
        sample_assessment_data["functional_changes"],
        sample_assessment_data["risk_factors"],
        sample_assessment_data["metrics"]
    )
    
    assert 0 <= risk_score <= 10
    assert isinstance(risk_score, float)

def test_priority_determination(analysis_agent, sample_assessment_data):
    risk_score = 8.5
    priority = analysis_agent._determine_priority(
        risk_score,
        sample_assessment_data["risk_factors"]
    )
    
    assert priority == "high"
    
    risk_score = 3.0
    priority = analysis_agent._determine_priority(
        risk_score,
        []  # No risk factors
    )
    
    assert priority == "low"

def test_insight_generation(analysis_agent, sample_assessment_data):
    insights = analysis_agent._generate_insights(
        sample_assessment_data["functional_changes"],
        sample_assessment_data["risk_factors"],
        sample_assessment_data["metrics"]
    )
    
    assert "functional_impact" in insights
    assert "risk_analysis" in insights
    assert "intervention_needs" in insights
    assert isinstance(insights["functional_impact"]["key_areas"], list)
    assert len(insights["risk_analysis"]["primary_risks"]) > 0

def test_recommendation_generation(analysis_agent):
    insights = {
        "functional_impact": {
            "key_areas": ["mobility", "self_care"],
            "overall_status": "moderate_impact",
            "trends": {"functional_trajectory": "declining"}
        },
        "risk_analysis": {
            "primary_risks": [
                {"type": "physical", "severity": "high"}
            ]
        }
    }
    
    recommendations = analysis_agent._generate_recommendations(
        insights,
        risk_score=7.5,
        priority_level="high"
    )
    
    assert len(recommendations) > 0
    assert all(
        isinstance(rec["recommendation"], str) and
        isinstance(rec["rationale"], str) and
        "timeframe" in rec
        for rec in recommendations
    )

@pytest.mark.asyncio
async def test_metrics_update(analysis_agent, sample_assessment_data):
    insights = analysis_agent._generate_insights(
        sample_assessment_data["functional_changes"],
        sample_assessment_data["risk_factors"],
        sample_assessment_data["metrics"]
    )
    
    await analysis_agent._update_metrics(insights, 7.5)
    
    messages = []
    while not analysis_agent.message_queue.empty():
        messages.append(await analysis_agent.message_queue.get())
    
    assert any(
        msg["type"] == "metric_update" and
        msg["metric"] == "analysis_completed"
        for msg in messages
    )

def test_functional_status_analysis(analysis_agent, sample_assessment_data):
    status = analysis_agent._analyze_functional_status(
        sample_assessment_data["functional_changes"]
    )
    
    assert status in ["severe_impact", "moderate_impact", "mild_impact"]

def test_key_impact_areas_identification(analysis_agent, sample_assessment_data):
    areas = analysis_agent._identify_key_impact_areas(
        sample_assessment_data["functional_changes"]
    )
    
    assert isinstance(areas, list)
    assert "mobility" in areas

def test_risk_trajectory_calculation(analysis_agent, sample_assessment_data):
    trajectory = analysis_agent._calculate_risk_trajectory(
        sample_assessment_data["metrics"]
    )
    
    assert trajectory in ["escalating", "moderate", "stable"]

def test_error_handling(analysis_agent):
    with pytest.raises(ValueError):
        analysis_agent._calculate_risk_score({}, [], {})

@pytest.mark.asyncio
async def test_session_management(analysis_agent, sample_assessment_data):
    context = AgentContext(
        session_id=uuid4(),
        user_id=uuid4()
    )
    
    result = await analysis_agent.analyze_assessment(sample_assessment_data, context)
    assert analysis_agent.status == AgentStatus.IDLE
    assert len(analysis_agent.active_contexts) == 0

def test_trending_analysis(analysis_agent, sample_assessment_data):
    trends = analysis_agent._analyze_trends(sample_assessment_data["metrics"])
    
    assert "functional_trajectory" in trends
    assert "risk_trajectory" in trends
    assert trends["functional_trajectory"] in ["improving", "declining", "stable"]
    assert trends["risk_trajectory"] in ["escalating", "moderate", "stable"]

def test_risk_analysis_categorization(analysis_agent, sample_assessment_data):
    primary_risks = analysis_agent._analyze_primary_risks(
        sample_assessment_data["risk_factors"]
    )
    secondary_risks = analysis_agent._analyze_secondary_risks(
        sample_assessment_data["risk_factors"]
    )
    env_risks = analysis_agent._analyze_environmental_factors(
        sample_assessment_data["risk_factors"]
    )
    
    assert len(primary_risks) == 1  # One high severity risk
    assert len(secondary_risks) == 1  # One moderate severity risk
    assert len(env_risks) == 1  # One environmental risk