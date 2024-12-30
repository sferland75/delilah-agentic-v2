import React from 'react';
import { useTaskManager } from '../../hooks/useTaskManager';
import { AgentTask } from '../../types/tasks';
import { format } from 'date-fns';

const TaskRow: React.FC<{ task: AgentTask }> = ({ task }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'FAILED': return 'bg-red-100 text-red-800';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
            case 'BLOCKED': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-600';
            case 'medium': return 'text-yellow-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="flex items-center justify-between p-4 border-b last:border-b-0">
            <div className="flex-1">
                <div className="flex items-center space-x-4">
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{task.type}</span>
                    <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                    </span>
                    {task.clientId && (
                        <span className="text-sm text-gray-500">Client: {task.clientId}</span>
                    )}
                </div>
                {task.error && (
                    <p className="mt-1 text-sm text-red-600">{task.error}</p>
                )}
            </div>
            <div className="flex items-center space-x-4">
                {task.progress !== undefined && (
                    <div className="w-24">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                                className="h-2 bg-blue-600 rounded-full transition-all duration-500" 
                                style={{ width: `${task.progress}%` }}
                            />
                        </div>
                    </div>
                )}
                <span className="text-sm text-gray-500 whitespace-nowrap">
                    {format(new Date(task.updated), 'HH:mm:ss')}
                </span>
            </div>
        </div>
    );
};

export const TaskMonitor: React.FC = () => {
    const { tasks, queueMetrics } = useTaskManager();
    
    const activeTasks = tasks.filter(task => 
        task.status !== 'COMPLETED' && task.status !== 'FAILED'
    );
    
    const recentCompletedTasks = tasks
        .filter(task => task.status === 'COMPLETED')
        .slice(0, 5);

    return (
        <div className="bg-white rounded-lg border">
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Task Monitor</h2>
            </div>
            
            {/* Queue Metrics */}
            <div className="grid grid-cols-4 gap-4 p-4 border-b bg-gray-50">
                {Object.entries(queueMetrics).map(([type, metrics]) => (
                    <div key={type} className="text-center">
                        <h3 className="text-sm font-medium text-gray-500 capitalize">{type}</h3>
                        <p className="mt-1 text-xl font-semibold text-gray-900">
                            {metrics.totalProcessed}
                        </p>
                        <p className="text-sm text-gray-500">
                            {metrics.successRate.toFixed(1)}% success
                        </p>
                    </div>
                ))}
            </div>

            {/* Active Tasks */}
            <div className="border-b">
                <div className="px-4 py-2 bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-700">Active Tasks</h3>
                </div>
                {activeTasks.length > 0 ? (
                    activeTasks.map(task => <TaskRow key={task.id} task={task} />)
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        No active tasks
                    </div>
                )}
            </div>

            {/* Recently Completed */}
            <div>
                <div className="px-4 py-2 bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-700">Recently Completed</h3>
                </div>
                {recentCompletedTasks.length > 0 ? (
                    recentCompletedTasks.map(task => <TaskRow key={task.id} task={task} />)
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        No completed tasks
                    </div>
                )}
            </div>
        </div>
    );
};