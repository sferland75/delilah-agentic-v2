import { v4 as uuidv4 } from 'uuid';
import { AgentTask, TaskStatus, TaskType } from '../types/tasks';

export const generateMockTasks = (): AgentTask[] => {
    const now = new Date();
    
    return [
        {
            id: uuidv4(),
            type: 'ASSESSMENT_INIT',
            priority: 'high',
            clientId: 'client_sarah_johnson',
            data: { assessmentType: 'initial', clientName: 'Sarah Johnson' },
            status: 'IN_PROGRESS',
            created: new Date(now.getTime() - 1000 * 60 * 5).toISOString(), // 5 mins ago
            updated: new Date(now.getTime() - 1000 * 30).toISOString(),
            retryCount: 0,
            maxRetries: 3,
            progress: 65
        },
        {
            id: uuidv4(),
            type: 'CLIENT_ANALYSIS',
            priority: 'medium',
            clientId: 'client_robert_chen',
            data: { analysisType: 'progress', clientName: 'Robert Chen' },
            status: 'PENDING',
            created: new Date(now.getTime() - 1000 * 60 * 2).toISOString(), // 2 mins ago
            updated: new Date(now.getTime() - 1000 * 60 * 2).toISOString(),
            retryCount: 0,
            maxRetries: 3
        },
        {
            id: uuidv4(),
            type: 'GENERATE_REPORT',
            priority: 'low',
            clientId: 'client_sarah_johnson',
            data: { reportType: 'monthly', clientName: 'Sarah Johnson' },
            status: 'COMPLETED',
            created: new Date(now.getTime() - 1000 * 60 * 15).toISOString(), // 15 mins ago
            updated: new Date(now.getTime() - 1000 * 60 * 10).toISOString(),
            retryCount: 0,
            maxRetries: 3,
            progress: 100
        }
    ];
};

export const mockTaskMetrics = {
    assessment: {
        totalProcessed: 15,
        successRate: 93.3,
        averageProcessingTime: 120
    },
    analysis: {
        totalProcessed: 22,
        successRate: 95.5,
        averageProcessingTime: 45
    },
    documentation: {
        totalProcessed: 18,
        successRate: 100,
        averageProcessingTime: 60
    },
    report: {
        totalProcessed: 12,
        successRate: 91.7,
        averageProcessingTime: 180
    }
};