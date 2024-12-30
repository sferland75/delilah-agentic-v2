import json
from datetime import datetime
from pathlib import Path
from uuid import UUID, uuid4
import pytest
from unittest.mock import Mock, patch

from agents.documentation_agent import (
    DocumentationAgent,
    DocumentationAgentConfig,
    Template,
    Report,
    ReportContent
)
from agents.base import AgentContext, AgentStatus

@pytest.fixture
def sample_template():
    return Template(
        id="default",
        content="{{summary}}\n{{assessment}}\n{{analysis}}\n{{recommendations}}",
        sections=[
            {"id": "summary", "type": "summary"},
            {"id": "assessment", "type": "assessment"},
            {"id": "analysis", "type": "analysis"},
            {"id": "recommendations", "type": "recommendations"}
        ],
        metadata={"version": "1.0"}
    )

@pytest.fixture
def sample_assessment_data():
    return {
        "id": str(uuid4()),
        "client_name": "John Doe",
        "assessment_date": datetime.utcnow().isoformat(),
        "mobility_score": 85,
        "daily_activities_score": 90,
        "notes": "Sample assessment notes"
    }

@pytest.fixture
def sample_analysis_results():
    return {
        "id": str(uuid4()),
        "risk_level": "low",
        "priority_areas": ["mobility", "self-care"],
        "recommendations": [
            "Continue current exercise routine",
            "Monitor daily activities progress"
        ]
    }

@pytest.fixture
def agent_config(tmp_path):
    template_dir = tmp_path / "templates"
    output_dir = tmp_path / "output"
    template_dir.mkdir()
    output_dir.mkdir()
    
    return DocumentationAgentConfig(
        template_dir=template_dir,
        output_dir=output_dir,
        max_concurrent_tasks=2
    )

@pytest.fixture
def agent_context():
    return AgentContext(
        session_id=uuid4(),
        user_id=uuid4(),
        therapist_id=uuid4(),
        client_id=uuid4()
    )

class TestDocumentationAgent:
    
    async def test_init(self, agent_config):
        agent = DocumentationAgent(agent_config)
        assert agent.status == AgentStatus.IDLE
        assert agent.type.value == "documentation"
    
    async def test_process_assessment(
        self,
        agent_config,
        agent_context,
        sample_template,
        sample_assessment_data,
        sample_analysis_results
    ):
        # Create mock template file
        template_path = agent_config.template_dir / "default.jinja2"
        template_path.write_text(sample_template.content)
        
        metadata_path = template_path.with_suffix('.json')
        metadata_path.write_text(json.dumps({
            "sections": sample_template.sections,
            "version": "1.0"
        }))
        
        agent = DocumentationAgent(agent_config)
        
        # Process assessment
        report = await agent.process_assessment(
            context=agent_context,
            assessment_data=sample_assessment_data,
            analysis_results=sample_analysis_results,
            template_id="default"
        )
        
        # Verify report structure
        assert isinstance(report, Report)
        assert isinstance(report.id, UUID)
        assert isinstance(report.content, ReportContent)
        assert report.template_id == "default"
        assert report.assessment_id == UUID(sample_assessment_data['id'])
        assert report.analysis_id == UUID(sample_analysis_results['id'])
        
        # Verify report sections
        for section in sample_template.sections:
            assert section['id'] in report.content.sections
    
    async def test_invalid_template(self, agent_config, agent_context, sample_assessment_data, sample_analysis_results):
        agent = DocumentationAgent(agent_config)
        
        with pytest.raises(ValueError, match="Template not found: invalid"):
            await agent.process_assessment(
                context=agent_context,
                assessment_data=sample_assessment_data,
                analysis_results=sample_analysis_results,
                template_id="invalid"
            )
    
    async def test_concurrent_processing(
        self,
        agent_config,
        sample_template,
        sample_assessment_data,
        sample_analysis_results
    ):
        # Create mock template file
        template_path = agent_config.template_dir / "default.jinja2"
        template_path.write_text(sample_template.content)
        
        metadata_path = template_path.with_suffix('.json')
        metadata_path.write_text(json.dumps({
            "sections": sample_template.sections,
            "version": "1.0"
        }))
        
        agent = DocumentationAgent(agent_config)
        
        # Create multiple contexts
        context1 = AgentContext(session_id=uuid4(), user_id=uuid4(), therapist_id=uuid4(), client_id=uuid4())
        context2 = AgentContext(session_id=uuid4(), user_id=uuid4(), therapist_id=uuid4(), client_id=uuid4())
        context3 = AgentContext(session_id=uuid4(), user_id=uuid4(), therapist_id=uuid4(), client_id=uuid4())
        
        # Process first two assessments (should succeed)
        task1 = agent.process_assessment(
            context=context1,
            assessment_data=sample_assessment_data,
            analysis_results=sample_analysis_results,
            template_id="default"
        )
        
        task2 = agent.process_assessment(
            context=context2,
            assessment_data=sample_assessment_data,
            analysis_results=sample_analysis_results,
            template_id="default"
        )
        
        # Third assessment should fail (max_concurrent_tasks=2)
        with pytest.raises(ValueError, match="Maximum concurrent tasks limit reached"):
            await agent.process_assessment(
                context=context3,
                assessment_data=sample_assessment_data,
                analysis_results=sample_analysis_results,
                template_id="default"
            )
        
        # Complete first two tasks
        report1 = await task1
        report2 = await task2
        
        assert isinstance(report1, Report)
        assert isinstance(report2, Report)
        assert report1.id != report2.id
    
    async def test_pdf_generation(
        self,
        agent_config,
        agent_context,
        sample_template,
        sample_assessment_data,
        sample_analysis_results
    ):
        with patch('weasyprint.HTML') as mock_html:
            # Mock PDF generation
            mock_pdf = b'Mock PDF Content'
            mock_html.return_value.write_pdf.return_value = mock_pdf
            
            # Create mock template file
            template_path = agent_config.template_dir / "default.jinja2"
            template_path.write_text(sample_template.content)
            
            metadata_path = template_path.with_suffix('.json')
            metadata_path.write_text(json.dumps({
                "sections": sample_template.sections,
                "version": "1.0"
            }))
            
            agent = DocumentationAgent(agent_config)
            
            # Process assessment
            report = await agent.process_assessment(
                context=agent_context,
                assessment_data=sample_assessment_data,
                analysis_results=sample_analysis_results,
                template_id="default"
            )
            
            # Verify PDF generation was called
            mock_html.assert_called_once()
            mock_html.return_value.write_pdf.assert_called_once()
            
            # Verify PDF was saved
            pdf_path = agent_config.output_dir / f"{report.id}.pdf"
            assert pdf_path.exists()
            assert pdf_path.read_bytes() == mock_pdf
    
    async def test_error_handling(
        self,
        agent_config,
        agent_context,
        sample_template,
        sample_assessment_data,
        sample_analysis_results
    ):
        agent = DocumentationAgent(agent_config)
        
        # Create mock template file with invalid content
        template_path = agent_config.template_dir / "default.jinja2"
        template_path.write_text("{{invalid_variable}}")
        
        metadata_path = template_path.with_suffix('.json')
        metadata_path.write_text(json.dumps({
            "sections": sample_template.sections,
            "version": "1.0"
        }))
        
        # Process should raise error and update agent status
        with pytest.raises(Exception):
            await agent.process_assessment(
                context=agent_context,
                assessment_data=sample_assessment_data,
                analysis_results=sample_analysis_results,
                template_id="default"
            )
        
        assert agent.status == AgentStatus.ERROR
        assert agent.error_count > 0
    
    async def test_template_caching(
        self,
        agent_config,
        agent_context,
        sample_template,
        sample_assessment_data,
        sample_analysis_results
    ):
        # Create mock template file
        template_path = agent_config.template_dir / "default.jinja2"
        template_path.write_text(sample_template.content)
        
        metadata_path = template_path.with_suffix('.json')
        metadata_path.write_text(json.dumps({
            "sections": sample_template.sections,
            "version": "1.0"
        }))
        
        agent = DocumentationAgent(agent_config)
        
        # First call should load template
        template1 = await agent.template_manager.get_template("default")
        
        # Second call should use cached template
        template2 = await agent.template_manager.get_template("default")
        
        assert template1 is template2