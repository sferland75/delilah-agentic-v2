import { v4 as uuidv4 } from 'uuid';
import { AgentType } from '../types/agent';
import { AgentTask, TaskQueue, TaskStatus, TaskType } from '../types/tasks';
import { generateMockTasks, mockTaskMetrics } from '../mocks/mockTasks';

export class TaskManager {
    private queues: Map<AgentType, TaskQueue>;
    private eventHandlers: Map<string, ((task: AgentTask) => void)[]>;

    constructor() {
        this.queues = new Map();
        this.eventHandlers = new Map();
        this.initializeQueues();
        this.initializeMockData();
    }

    private initializeQueues() {
        const agentTypes: AgentType[] = ['assessment', 'analysis', 'documentation', 'report'];
        agentTypes.forEach(type => {
            this.queues.set(type, {
                id: uuidv4(),
                agentType: type,
                tasks: [],
                capacity: 5,
                processing: [],
                paused: false,
                metrics: mockTaskMetrics[type]
            });
        });
    }

    private initializeMockData() {
        const mockTasks = generateMockTasks();
        mockTasks.forEach(task => {
            const agentType = this.determineAgentType(task.type);
            const queue = this.queues.get(agentType);
            if (queue) {
                if (task.status === 'PENDING') {
                    queue.tasks.push(task);
                } else if (task.status === 'IN_PROGRESS') {
                    queue.processing.push(task);
                }
                if (task.status === 'IN_PROGRESS') {
                    this.simulateTaskProgress(task);
                }
            }
        });
    }

    private simulateTaskProgress(task: AgentTask) {
        let progress = task.progress || 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                this.updateTaskStatus(task.id, 'COMPLETED', 100);
            } else {
                this.updateTaskStatus(task.id, 'IN_PROGRESS', progress);
            }
        }, 3000);
    }

    private determineAgentType(taskType: TaskType): AgentType {
        const mappings: Record<TaskType, AgentType> = {
            'ASSESSMENT_INIT': 'assessment',
            'ASSESSMENT_REVIEW': 'assessment',
            'GENERATE_REPORT': 'report',
            'CLIENT_ANALYSIS': 'analysis',
            'DOCUMENT_PROCESSING': 'documentation'
        };
        return mappings[taskType];
    }

    private sortQueue(queue: TaskQueue) {
        const priorityValues = { high: 3, medium: 2, low: 1 };
        queue.tasks.sort((a, b) => {
            const priorityDiff = priorityValues[b.priority] - priorityValues[a.priority];
            if (priorityDiff !== 0) return priorityDiff;
            return new Date(a.created).getTime() - new Date(b.created).getTime();
        });
    }

    public on(event: string, handler: (task: AgentTask) => void) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event)?.push(handler);
    }

    public emit(event: string, task: AgentTask) {
        this.eventHandlers.get(event)?.forEach(handler => handler(task));
    }

    public async createTask(
        type: TaskType,
        data: any,
        priority: 'high' | 'medium' | 'low' = 'medium',
        clientId?: string
    ): Promise<AgentTask> {
        const task: AgentTask = {
            id: uuidv4(),
            type,
            priority,
            clientId,
            data,
            status: 'PENDING',
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            retryCount: 0,
            maxRetries: 3
        };

        const agentType = this.determineAgentType(type);
        const queue = this.queues.get(agentType);
        
        if (!queue) {
            throw new Error(`No queue found for agent type: ${agentType}`);
        }

        queue.tasks.push(task);
        this.sortQueue(queue);
        this.emit('taskCreated', task);
        
        setTimeout(() => {
            this.updateTaskStatus(task.id, 'IN_PROGRESS', 0);
            this.simulateTaskProgress(task);
        }, 2000);
        
        return task;
    }

    public async updateTaskStatus(
        taskId: string,
        status: TaskStatus,
        progress?: number,
        error?: string
    ): Promise<AgentTask> {
        const task = this.findTaskById(taskId);
        if (!task) {
            throw new Error(`Task not found: ${taskId}`);
        }

        task.status = status;
        task.updated = new Date().toISOString();
        if (progress !== undefined) task.progress = progress;
        if (error) task.error = error;

        if (['COMPLETED', 'FAILED'].includes(status)) {
            const queue = this.queues.get(this.determineAgentType(task.type));
            if (queue) {
                queue.processing = queue.processing.filter(t => t.id !== taskId);
                queue.metrics.totalProcessed++;
                queue.metrics.successRate = (queue.metrics.successRate * (queue.metrics.totalProcessed - 1) + 
                    (status === 'COMPLETED' ? 100 : 0)) / queue.metrics.totalProcessed;
            }
        }

        this.emit('taskUpdated', task);
        return task;
    }

    public getQueueMetrics(agentType: AgentType) {
        return this.queues.get(agentType)?.metrics;
    }

    public getQueueStatus(agentType: AgentType) {
        const queue = this.queues.get(agentType);
        if (!queue) return null;

        return {
            pending: queue.tasks.length,
            processing: queue.processing.length,
            capacity: queue.capacity,
            paused: queue.paused,
            metrics: queue.metrics
        };
    }

    private findTaskById(taskId: string): AgentTask | null {
        const queues = Array.from(this.queues.values());
        for (const queue of queues) {
            const allTasks = [...queue.tasks, ...queue.processing];
            const task = allTasks.find(t => t.id === taskId);
            if (task) return task;
        }
        return null;
    }
}