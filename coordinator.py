import asyncio
from typing import Dict
from uuid import UUID

from agents.assessment_agent import AssessmentAgent
from agents.documentation_agent import DocumentationAgent
from agents.analysis_agent import AnalysisAgent
from agents.report_agent import ReportAgent
from agents.client_manager import ClientManager
from agents.therapist_manager import TherapistManager
from agents.user_manager import UserManager

class AgentCoordinator:
    def __init__(self):
        self.assessment_agent = AssessmentAgent()
        self.documentation_agent = DocumentationAgent()
        self.analysis_agent = AnalysisAgent()
        self.report_agent = ReportAgent()
        self.client_manager = ClientManager()
        self.therapist_manager = TherapistManager()
        self.user_manager = UserManager()
        self.active_sessions: Dict[UUID, dict] = {}
    
    async def run(self):
        """Start message handling for all agents"""
        await asyncio.gather(
            self._handle_assessment_messages(),
            self._handle_documentation_messages(),
            self._handle_analysis_messages(),
            self._handle_report_messages()
        )
    
    async def _handle_assessment_messages(self):
        """Process messages from Assessment Agent"""
        while True:
            message = await self.assessment_agent.message_queue.get()
            if message['type'] in ['assessment_started', 'step_completed', 'assessment_completed']:
                await self.documentation_agent.process_message(message)
                
                if message['type'] == 'assessment_completed':
                    await self.therapist_manager.record_assessment(
                        therapist_id=message['therapist_id'],
                        assessment_id=message['session_id']
                    )
    
    async def _handle_documentation_messages(self):
        """Process messages from Documentation Agent"""
        while True:
            message = await self.documentation_agent.message_queue.get()
            if message['type'] == 'documentation_complete':
                await self.analysis_agent.process_documentation(message)
    
    async def _handle_analysis_messages(self):
        """Process messages from Analysis Agent"""
        while True:
            message = await self.analysis_agent.message_queue.get()
            if message['type'] == 'analysis_complete':
                await self.report_agent.process_analysis(message)
    
    async def _handle_report_messages(self):
        """Process messages from Report Agent"""
        while True:
            message = await self.report_agent.message_queue.get()
            if message['type'] == 'report_generated':
                session_id = message['session_id']
                self.active_sessions[session_id]['status'] = 'report_ready'
    
    async def start_assessment(self, client_id: UUID, therapist_id: UUID, assessment_type: str) -> UUID:
        """Initialize a new assessment session"""
        # Verify client exists
        client = await self.client_manager.get_client(client_id)
        if not client:
            raise ValueError("Client not found")
            
        # Verify therapist exists and is active
        therapist = await self.therapist_manager.get_therapist(therapist_id)
        if not therapist:
            raise ValueError("Therapist not found")
        if not therapist.is_active:
            raise ValueError("Therapist is not active")
        
        session_id = await self.assessment_agent.start_assessment(
            client_id=client_id,
            therapist_id=therapist_id,
            assessment_type=assessment_type
        )
        
        self.active_sessions[session_id] = {
            'status': 'in_progress',
            'client_id': client_id,
            'therapist_id': therapist_id,
            'assessment_type': assessment_type
        }
        
        return session_id
    
    async def get_session_status(self, session_id: UUID) -> Dict:
        """Get current status of assessment session"""
        if session_id not in self.active_sessions:
            raise ValueError('Invalid session ID')
            
        status = self.active_sessions[session_id]['status']
        result = {
            'status': status,
            'assessment': await self.assessment_agent.get_next_step(session_id),
            'analysis': await self.analysis_agent.get_analysis(session_id),
            'report': await self.report_agent.get_report(session_id)
        }
        
        return result