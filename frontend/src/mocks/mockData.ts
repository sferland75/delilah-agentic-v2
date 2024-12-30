import { v4 as uuidv4 } from 'uuid';
import { AgentStatusData, AgentType, AgentStatus, AgentMessage, Priority } from '../types/agent';

// Client mock data
export const mockClients = {
    client1: {
        id: uuidv4(),
        name: "Sarah Johnson",
        age: 45,
        referralDate: "2024-01-15",
        status: "active",
        assessmentType: "IHA",
        primaryDiagnosis: "Post-MVA Injuries",
        assessments: [
            {
                id: uuidv4(),
                type: "Initial",
                date: "2024-01-20",
                status: "completed",
                findings: {
                    physicalSymptoms: [
                        { symptom: "Neck pain", severity: "moderate", painRating: 6 },
                        { symptom: "Lower back pain", severity: "severe", painRating: 8 }
                    ],
                    functionalLimitations: [
                        { activity: "Walking", limitation: "moderate", details: "Limited to 10 minutes" },
                        { activity: "Sitting", limitation: "severe", details: "Cannot maintain beyond 30 minutes" }
                    ],
                    recommendations: [
                        { type: "Treatment", details: "Physiotherapy 2x weekly" },
                        { type: "Equipment", details: "Ergonomic chair assessment" }
                    ]
                }
            }
        ]
    },
    client2: {
        id: uuidv4(),
        name: "Robert Chen",
        age: 32,
        referralDate: "2024-01-10",
        status: "active",
        assessmentType: "CAT",
        primaryDiagnosis: "Traumatic Brain Injury",
        assessments: [
            {
                id: uuidv4(),
                type: "Initial",
                date: "2024-01-12",
                status: "completed",
                findings: {
                    cognitiveSymptoms: [
                        { symptom: "Memory difficulties", severity: "moderate", impact: "Daily tasks affected" },
                        { symptom: "Concentration issues", severity: "severe", impact: "Unable to work" }
                    ],
                    functionalLimitations: [
                        { activity: "Meal preparation", limitation: "moderate", details: "Requires prompting" },
                        { activity: "Financial management", limitation: "severe", details: "Unable to manage independently" }
                    ],
                    recommendations: [
                        { type: "Assessment", details: "Neuropsychological evaluation" },
                        { type: "Support", details: "Occupational therapy for ADL retraining" }
                    ]
                }
            }
        ]
    }
};

// Agent status mock data
export const mockAgentStatus: Record<string, AgentStatusData> = {
    assessment_agent: {
        id: uuidv4(),
        type: 'assessment' as AgentType,
        status: 'idle' as AgentStatus,
        lastActive: "2024-01-22T10:30:00Z"
    },
    analysis_agent: {
        id: uuidv4(),
        type: 'analysis' as AgentType,
        status: 'busy' as AgentStatus,
        lastActive: "2024-01-22T10:35:00Z"
    },
    documentation_agent: {
        id: uuidv4(),
        type: 'documentation' as AgentType,
        status: 'idle' as AgentStatus,
        lastActive: "2024-01-22T10:20:00Z"
    }
};

// Dashboard metrics mock data
export const mockMetrics = {
    activeAssessments: {
        value: 2,
        trend: 0,
        details: "2 assessments in progress",
        timestamp: new Date().toISOString()
    },
    insightsGenerated: {
        value: 4,
        trend: 50,
        details: "4 new insights in last 24 hours",
        timestamp: new Date().toISOString()
    },
    reportsCompleted: {
        value: 1,
        trend: 0,
        details: "1 report completed today",
        timestamp: new Date().toISOString()
    }
};

export class MockDataGenerator {
    private intervalId: NodeJS.Timeout | null = null;

    private generateInsightMessage(): AgentMessage {
        const clientNames = ['Sarah Johnson', 'Robert Chen'];
        const clientName = clientNames[Math.floor(Math.random() * clientNames.length)];
        const insightTypes = ['risk_alert', 'progress_note', 'safety_alert'];
        const insightType = insightTypes[Math.floor(Math.random() * insightTypes.length)];
        const priority = Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low';
        
        return {
            type: 'insight_generated',
            id: uuidv4(),
            payload: {
                message: `New ${insightType} for ${clientName}`,
                priority: priority as Priority
            },
            source: {
                id: uuidv4(),
                type: 'analysis'
            }
        };
    }

    private generateMetricUpdate(): AgentMessage {
        const metrics = ['activeAssessments', 'insightsGenerated', 'reportsCompleted'];
        const metric = metrics[Math.floor(Math.random() * metrics.length)];
        
        return {
            type: 'metric_update',
            metric,
            data: {
                value: Math.floor(Math.random() * 10),
                trend: Math.floor(Math.random() * 20) - 10,
                timestamp: new Date().toISOString()
            },
            source: {
                id: uuidv4(),
                type: 'analysis'
            }
        };
    }

    private generateStatusUpdate(): AgentMessage {
        const agents = Object.keys(mockAgentStatus);
        const agentId = agents[Math.floor(Math.random() * agents.length)];
        const statuses: AgentStatus[] = ['idle', 'busy', 'error'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        return {
            type: 'session_started',
            session_id: uuidv4(),
            source: {
                id: agentId,
                type: mockAgentStatus[agentId].type
            }
        };
    }

    generateSingleUpdate(): AgentMessage {
        const updateTypes = ['metric', 'insight', 'status'];
        const type = updateTypes[Math.floor(Math.random() * updateTypes.length)];
        
        switch(type) {
            case 'metric':
                return this.generateMetricUpdate();
            case 'insight':
                return this.generateInsightMessage();
            case 'status':
                return this.generateStatusUpdate();
            default:
                return this.generateMetricUpdate();
        }
    }

    startGenerating(callback: (update: AgentMessage) => void, interval: number = 3000) {
        this.intervalId = setInterval(() => {
            const update = this.generateSingleUpdate();
            callback(update);
        }, interval);
    }

    stopGenerating() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}