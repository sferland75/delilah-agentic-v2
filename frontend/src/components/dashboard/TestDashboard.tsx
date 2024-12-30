import React from 'react';
import { useAgentState } from '../../hooks/useAgentState';
import { useTaskManager } from '../../hooks/useTaskManager';
import { AgentStatus, AgentStatusData } from '../../types/agent';
import { TaskMonitor } from './TaskMonitor';
import { format } from 'date-fns';

// ... [Previous StatusBadge and MetricCard components remain the same] ...

export const TestDashboard: React.FC = () => {
    const { state, isConnected, clearInsights, clearErrors } = useAgentState();
    const { createTask } = useTaskManager();
    const { metrics, insights, errors, activeAgents } = state;

    const handleCreateTestTask = async () => {
        await createTask(
            'ASSESSMENT_INIT',
            {
                clientId: '123',
                assessmentType: 'initial'
            },
            'medium'
        );
    };

    return (
        <div className="p-6 space-y-6">
            {/* Previous sections remain the same */}
            
            {/* Task Monitor */}
            <TaskMonitor />

            {/* Test Controls */}
            <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Test Controls</h2>
                    <button
                        onClick={handleCreateTestTask}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        Create Test Task
                    </button>
                </div>
            </div>
        </div>
    );
};