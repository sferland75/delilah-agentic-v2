export type AgentType = 'assessment' | 'analysis' | 'documentation' | 'report';
export type AgentStatus = 'idle' | 'busy' | 'error' | 'disabled';
export type Priority = 'high' | 'medium' | 'low';

export interface AgentIdentifier {
    type: AgentType;
    id: string;
}

export interface AgentStatusData {
    id: string;
    type: AgentType;
    status: AgentStatus;
    lastActive: string;
}

export interface InsightData {
    id: string;
    message: string;
    priority: Priority;
    timestamp: string;
    source: AgentIdentifier;
}

export interface MetricUpdate {
    type: 'metric_update';
    metric: string;
    data: {
        value?: number;
        trend?: number;
        details?: any;
        timestamp: string;
    };
    source?: AgentIdentifier;
}

export interface AgentError {
    type: 'agent_error';
    error: string;
    source?: AgentIdentifier;
    timestamp: string;
}

export interface SessionUpdate {
    type: 'session_started' | 'session_ended';
    session_id: string;
    source?: AgentIdentifier;
}

export interface InsightMessage {
    type: 'insight_generated';
    id: string;
    payload: {
        message: string;
        priority: Priority;
    };
    source?: AgentIdentifier;
}

export type AgentMessage = MetricUpdate | AgentError | SessionUpdate | InsightMessage;

export interface AgentState {
    activeAgents: Record<string, AgentStatusData>;
    metrics: Record<string, any>;
    insights: InsightData[];
    errors: AgentError[];
    lastUpdate: string;
}