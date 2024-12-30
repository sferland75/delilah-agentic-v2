import { AgentType, Priority } from './agent';

export type TaskType = 
  | 'ASSESSMENT_INIT'
  | 'ASSESSMENT_REVIEW'
  | 'GENERATE_REPORT'
  | 'CLIENT_ANALYSIS'
  | 'DOCUMENT_PROCESSING';

export type TaskStatus = 
  | 'PENDING'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'BLOCKED';

export interface TaskDependency {
  taskId: string;
  type: 'REQUIRED' | 'OPTIONAL';
  status: TaskStatus[];
}

export interface AgentTask {
  id: string;
  type: TaskType;
  priority: Priority;
  clientId?: string;
  data: any;
  status: TaskStatus;
  assignedAgent?: string;
  dependencies?: TaskDependency[];
  created: string;
  updated: string;
  deadline?: string;
  progress?: number;
  retryCount: number;
  maxRetries: number;
  error?: string;
}

export interface TaskQueue {
  id: string;
  agentType: AgentType;
  tasks: AgentTask[];
  capacity: number;
  processing: AgentTask[];
  paused: boolean;
  metrics: {
    totalProcessed: number;
    successRate: number;
    averageProcessingTime: number;
  };
}