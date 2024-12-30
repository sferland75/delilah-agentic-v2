import pytest
import asyncio
from datetime import datetime
from uuid import uuid4
from coordinator.coordinator import Coordinator
from agents.assessment_agent import AssessmentAgent, AssessmentData, AssessmentType
from agents.base import AgentContext, AgentStatus

@pytest.fixture
async def coordinator():
    coord = Coordinator()
    await coord.initialize()
    yield coord
    await coord.shutdown()

@pytest.fixture
def assessment_agent():
    return AssessmentAgent()

@pytest.fixture
def sample_assessment_type():
    return AssessmentType(
        name="mobility_assessment",
        version="1.0",
        fields=[
            {"name": "walking_score", "type": "int", "range": [0, 10]},
            {"name": "balance_score", "type": "int", "range": [0, 10]}
        ],
        required_fields=["walking_score", "balance_score"],
        scoring_rules={
            "mobility_index": {
                "type": "average",
                "fields": ["walking_score", "balance_score"]
            }
        }
    )

@pytest.fixture
def sample_assessment_data():
    return AssessmentData(
        assessment_type="mobility_assessment",
        version="1.0",
        client_id=uuid4(),
        therapist_id=uuid4(),
        responses={
            "walking_score": 8,
            "balance_score": 7
        }
    )

@pytest.mark.asyncio
async def test_register_agent(coordinator, assessment_agent):
    coordinator.register_agent(assessment_agent)
    assert str(assessment_agent.id) in coordinator.agents
    assert str(assessment_agent.id) in coordinator.message_queues

@pytest.mark.asyncio
async def test_unregister_agent(coordinator, assessment_agent):
    agent_id = str(assessment_agent.id)
    coordinator.register_agent(assessment_agent)
    coordinator.unregister_agent(agent_id)
    assert agent_id not in coordinator.agents
    assert agent_id not in coordinator.message_queues

@pytest.mark.asyncio
async def test_start_assessment_workflow(
    coordinator, 
    assessment_agent, 
    sample_assessment_type,
    sample_assessment_data
):
    # Register and configure assessment agent
    await assessment_agent.register_assessment_type(sample_assessment_type)
    coordinator.register_agent(assessment_agent)
    
    # Create context
    context = AgentContext(
        session_id=uuid4(),
        therapist_id=sample_assessment_data.therapist_id,
        client_id=sample_assessment_data.client_id
    )
    
    # Start workflow
    workflow_id = await coordinator.start_assessment_workflow(
        sample_assessment_data,
        context
    )
    
    assert workflow_id in coordinator.active_workflows
    assert coordinator.active_workflows[workflow_id]["status"] in {"started", "completed"}
    
    # Wait for workflow to complete
    await asyncio.sleep(0.1)
    
    status = coordinator.get_workflow_status(workflow_id)
    assert status is not None
    assert status["status"] == "completed"

@pytest.mark.asyncio
async def test_workflow_error_handling(
    coordinator,
    assessment_agent,
    sample_assessment_data
):
    # Register agent without configuring assessment type (will cause error)
    coordinator.register_agent(assessment_agent)
    
    context = AgentContext(
        session_id=uuid4(),
        therapist_id=sample_assessment_data.therapist_id,
        client_id=sample_assessment_data.client_id
    )
    
    workflow_id = await coordinator.start_assessment_workflow(
        sample_assessment_data,
        context
    )
    
    # Wait for workflow to process
    await asyncio.sleep(0.1)
    
    status = coordinator.get_workflow_status(workflow_id)
    assert status is not None
    assert status["status"] == "error"
    assert "error" in status

@pytest.mark.asyncio
async def test_agent_status_tracking(
    coordinator,
    assessment_agent,
    sample_assessment_type,
    sample_assessment_data
):
    # Register and configure assessment agent
    await assessment_agent.register_assessment_type(sample_assessment_type)
    coordinator.register_agent(assessment_agent)
    
    agent_id = str(assessment_agent.id)
    
    # Check initial status
    status = coordinator.get_agent_status(agent_id)
    assert status is not None
    assert status["status"] == AgentStatus.IDLE.value
    
    # Start workflow
    context = AgentContext(
        session_id=uuid4(),
        therapist_id=sample_assessment_data.therapist_id,
        client_id=sample_assessment_data.client_id
    )
    
    workflow_id = await coordinator.start_assessment_workflow(
        sample_assessment_data,
        context
    )
    
    # Wait for workflow to complete
    await asyncio.sleep(0.1)
    
    # Check final status
    status = coordinator.get_agent_status(agent_id)
    assert status is not None
    assert status["status"] == AgentStatus.IDLE.value
    assert status["error_count"] == 0