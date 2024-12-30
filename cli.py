import asyncio
import uuid
from coordinator import AgentCoordinator
from agents.assessment_agent import AssessmentType

class DelilahCLI:
    def __init__(self):
        self.coordinator = AgentCoordinator()
    
    async def run(self):
        print('Welcome to Delilah Agentic OT Assessment System')
        print('-------------------------------------------\n')
        
        # Simulate client/therapist IDs
        client_id = uuid.uuid4()
        therapist_id = uuid.uuid4()
        
        # Start assessment
        print('Starting new ADL assessment...')
        session_id = await self.coordinator.start_assessment(
            client_id=client_id,
            therapist_id=therapist_id,
            assessment_type=AssessmentType.ADL.value
        )
        
        # Start coordinator
        coordinator_task = asyncio.create_task(self.coordinator.run())
        
        try:
            # Process assessment steps
            while True:
                status = await self.coordinator.get_session_status(session_id)
                
                if status['status'] == 'report_ready':
                    print('\nAssessment complete!')
                    self._display_report(status['report'])
                    break
                
                if step := status['assessment']:
                    response = await self._get_step_input(step)
                    await self.coordinator.assessment_agent.submit_response(
                        session_id=session_id,
                        step_id=step.id,
                        response=response
                    )
                
                await asyncio.sleep(1)  # Give time for processing
        
        finally:
            coordinator_task.cancel()
    
    async def _get_step_input(self, step):
        print(f'\n{step.question}')
        
        if step.input_type == 'scale' and step.options:
            for i, option in enumerate(step.options, 1):
                print(f'{i}. {option}')
            while True:
                try:
                    choice = int(input('Select option (number): ')) - 1
                    if 0 <= choice < len(step.options):
                        return step.options[choice]
                    print('Invalid choice')
                except ValueError:
                    print('Please enter a number')
        else:
            return input('Enter response: ')
    
    def _display_report(self, report):
        print('\nAssessment Report')
        print('-----------------')
        print(report.summary)

def main():
    cli = DelilahCLI()
    asyncio.run(cli.run())

if __name__ == '__main__':
    main()