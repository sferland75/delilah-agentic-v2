import { useState, useEffect, useCallback } from 'react';
import { AgentType } from '../types/agent';
import { AgentTask, TaskQueue, TaskStatus, TaskType } from '../types/tasks';
import { TaskManager } from '../services/TaskManager';

const taskManager = new TaskManager();

export function useTaskManager() {
    const [tasks, setTasks] = useState<AgentTask[]>([]);
    const [queueMetrics, setQueueMetrics] = useState<Record<AgentType, TaskQueue['metrics']>>({} as any);

    useEffect(() => {
        // Subscribe to task events
        taskManager.on('taskCreated', handleTaskUpdate);
        taskManager.on('taskAssigned', handleTaskUpdate);
        taskManager.on('taskUpdated', handleTaskUpdate);

        // Update metrics periodically
        const intervalId = setInterval(updateMetrics, 5000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const handleTaskUpdate = useCallback((task: AgentTask) => {
        setTasks(prev => {
            const newTasks = prev.filter(t => t.id !== task.id);
            return [...newTasks, task].sort((a, b) => 
                new Date(b.updated).getTime() - new Date(a.updated).getTime()
            );
        });
        updateMetrics();
    }, []);

    const updateMetrics = useCallback(() => {
        const agentTypes: AgentType[] = ['assessment', 'analysis', 'documentation', 'report'];
        const metrics = agentTypes.reduce((acc, type) => ({
            ...acc,
            [type]: taskManager.getQueueMetrics(type)
        }), {} as Record<AgentType, TaskQueue['metrics']>);
        
        setQueueMetrics(metrics);
    }, []);

    const createTask = useCallback(async (
        type: TaskType,
        data: any,
        priority?: 'high' | 'medium' | 'low',
        clientId?: string
    ) => {
        return taskManager.createTask(type, data, priority, clientId);
    }, []);

    const updateTaskStatus = useCallback(async (
        taskId: string,
        status: TaskStatus,
        progress?: number,
        error?: string
    ) => {
        return taskManager.updateTaskStatus(taskId, status, progress, error);
    }, []);

    const getQueueStatus = useCallback((agentType: AgentType) => {
        return taskManager.getQueueStatus(agentType);
    }, []);

    return {
        tasks,
        queueMetrics,
        createTask,
        updateTaskStatus,
        getQueueStatus
    };
}