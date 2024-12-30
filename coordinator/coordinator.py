                self.main_queue.task_done()

    def get_agent_status(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get the current status of an agent"""
        if agent_id in self.agents:
            agent = self.agents[agent_id]
            return {
                "id": agent_id,
                "name": agent.name,
                "type": agent.type.value,
                "status": agent.status.value,
                "last_active": agent.last_active,
                "error_count": agent.error_count,
                "active_assessments": len(agent.active_contexts)
            }
        return None
        
    async def resume_assessment(self, workflow_id: UUID) -> None:
        """Resume a paused or errored assessment workflow"""
        workflow = self.workflow_manager.get_workflow(workflow_id)
        if not workflow:
            raise ValueError(f"Workflow not found: {workflow_id}")
            
        if workflow.status not in [WorkflowStatus.ERROR, WorkflowStatus.PENDING]:
            raise ValueError(f"Cannot resume workflow in status: {workflow.status.value}")
            
        await self.workflow_manager.start_workflow(workflow_id)
        logger.info(f"Resumed assessment workflow: {workflow_id}")

    def get_weekly_summary(self) -> Dict[str, Any]:
        """Get summary of assessment activity for the current week"""
        all_workflows = self.workflow_manager.list_workflows()
        
        # Filter to current week
        current_week_start = datetime.utcnow().replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        while current_week_start.weekday() != 0:  # Monday
            current_week_start = current_week_start.replace(day=current_week_start.day - 1)
            
        current_week_workflows = [
            w for w in all_workflows 
            if w.created_at >= current_week_start
        ]
        
        return {
            "total": len(current_week_workflows),
            "completed": len([w for w in current_week_workflows if w.status == WorkflowStatus.COMPLETED]),
            "in_progress": len([w for w in current_week_workflows if w.status == WorkflowStatus.IN_PROGRESS]),
            "pending": len([w for w in current_week_workflows if w.status == WorkflowStatus.PENDING]),
            "error": len([w for w in current_week_workflows if w.status == WorkflowStatus.ERROR])
        }
