import { AgentType, AgentStatus, AgentMessage, InsightData } from '../../types/agent';
import { AssessmentData, AssessmentType } from '../../types/assessment';

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

export interface FunctionalChange {
    type: 'adl' | 'mobility' | 'cognitive' | 'emotional';
    activity?: string;
    preStatus?: string;
    currentStatus?: string;
    details: string;
}

export interface RiskFactor {
    type: string;
    severity: 'high' | 'moderate' | 'low';
    details: string;
    recommendations: string[];
}

export interface AssessmentMetrics {
    functionalStatus: {
        totalActivities: number;
        independent: number;
        requiresAssistance: number;
        unable: number;
    };
    symptomCounts: {
        physical: number;
        cognitive: number;
        emotional: number;
    };
    attendantCare?: {
        totalHours: number;
        monthlyBenefit: number;
        careLevels: Record<number, number>;
    };
}

export interface AssessmentRecommendation {
    type: string;
    priority: 'high' | 'moderate' | 'low';
    recommendation: string;
    rationale: string;
}

export interface AgentAnalysis {
    functionalChanges: FunctionalChange[];
    riskFactors: RiskFactor[];
    metrics: AssessmentMetrics;
    recommendations: AssessmentRecommendation[];
}

class AssessmentAgentService {
    private status: AgentStatus = 'idle';
    private sessionId: string | null = null;
    private messageHandlers: ((message: AgentMessage) => void)[] = [];

    constructor() {
        // Initialize WebSocket connection for real-time agent communication
        this.initializeWebSocket();
    }

    private initializeWebSocket() {
        // TODO: Implement WebSocket connection to backend agent
    }

    public addMessageHandler(handler: (message: AgentMessage) => void) {
        this.messageHandlers.push(handler);
    }

    public removeMessageHandler(handler: (message: AgentMessage) => void) {
        this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    }

    private handleMessage(message: AgentMessage) {
        this.messageHandlers.forEach(handler => handler(message));
    }

    public getStatus(): AgentStatus {
        return this.status;
    }

    public async validateAssessment(assessment: AssessmentData): Promise<ValidationResult> {
        try {
            const response = await fetch('/api/agents/assessment/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(assessment),
            });

            if (!response.ok) {
                throw new Error('Validation request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Assessment validation error:', error);
            return {
                valid: false,
                errors: ['Failed to validate assessment'],
            };
        }
    }

    public async analyzeAssessment(assessment: AssessmentData): Promise<AgentAnalysis> {
        try {
            const response = await fetch('/api/agents/assessment/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(assessment),
            });

            if (!response.ok) {
                throw new Error('Analysis request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Assessment analysis error:', error);
            throw error;
        }
    }

    public async startSession(assessment: AssessmentData): Promise<string> {
        try {
            const response = await fetch('/api/agents/assessment/session/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    assessmentId: assessment.id,
                    assessmentType: assessment.assessmentType,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to start agent session');
            }

            const { sessionId } = await response.json();
            this.sessionId = sessionId;
            return sessionId;
        } catch (error) {
            console.error('Failed to start agent session:', error);
            throw error;
        }
    }

    public async endSession(): Promise<void> {
        if (!this.sessionId) return;

        try {
            await fetch(`/api/agents/assessment/session/${this.sessionId}/end`, {
                method: 'POST',
            });
            this.sessionId = null;
        } catch (error) {
            console.error('Failed to end agent session:', error);
            throw error;
        }
    }
}

export const assessmentAgent = new AssessmentAgentService();