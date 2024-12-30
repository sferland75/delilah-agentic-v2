import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { assessmentAgent } from '../services/agents/assessmentAgent';
import type { 
    ValidationResult, 
    AgentAnalysis, 
    RiskFactor, 
    AssessmentRecommendation 
} from '../services/agents/assessmentAgent';
import { AgentMessage, AgentStatus } from '../types/agent';
import { AssessmentData } from '../types/assessment';

interface AssessmentAgentContextType {
    status: AgentStatus;
    sessionId: string | null;
    analysis: AgentAnalysis | null;
    insights: AgentMessage[];
    startAssessmentSession: (assessment: AssessmentData) => Promise<void>;
    endAssessmentSession: () => Promise<void>;
    validateAssessment: (assessment: AssessmentData) => Promise<ValidationResult>;
    analyzeAssessment: (assessment: AssessmentData) => Promise<void>;
    clearAnalysis: () => void;
}

const AssessmentAgentContext = createContext<AssessmentAgentContextType | null>(null);

export const AssessmentAgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [status, setStatus] = useState<AgentStatus>('idle');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<AgentAnalysis | null>(null);
    const [insights, setInsights] = useState<AgentMessage[]>([]);

    useEffect(() => {
        const handleMessage = (message: AgentMessage) => {
            setInsights(prev => [...prev, message]);
        };

        assessmentAgent.addMessageHandler(handleMessage);

        return () => {
            assessmentAgent.removeMessageHandler(handleMessage);
        };
    }, []);

    const startAssessmentSession = useCallback(async (assessment: AssessmentData) => {
        const newSessionId = await assessmentAgent.startSession(assessment);
        setSessionId(newSessionId);
        setStatus('busy');
    }, []);

    const endAssessmentSession = useCallback(async () => {
        await assessmentAgent.endSession();
        setSessionId(null);
        setStatus('idle');
        setAnalysis(null);
        setInsights([]);
    }, []);

    const validateAssessment = useCallback(async (assessment: AssessmentData) => {
        return await assessmentAgent.validateAssessment(assessment);
    }, []);

    const analyzeAssessment = useCallback(async (assessment: AssessmentData) => {
        const result = await assessmentAgent.analyzeAssessment(assessment);
        setAnalysis(result);
    }, []);

    const clearAnalysis = useCallback(() => {
        setAnalysis(null);
    }, []);

    const value = {
        status,
        sessionId,
        analysis,
        insights,
        startAssessmentSession,
        endAssessmentSession,
        validateAssessment,
        analyzeAssessment,
        clearAnalysis,
    };

    return (
        <AssessmentAgentContext.Provider value={value}>
            {children}
        </AssessmentAgentContext.Provider>
    );
};

export const useAssessmentAgent = () => {
    const context = useContext(AssessmentAgentContext);
    if (!context) {
        throw new Error('useAssessmentAgent must be used within an AssessmentAgentProvider');
    }
    return context;
};