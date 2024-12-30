import React, { createContext, useContext, useState, useCallback } from 'react';
import { AssessmentData } from '../types/assessment';
import { 
    WorkflowState, 
    WorkflowAction,
    assessmentWorkflowService 
} from '../services/assessmentWorkflow';

interface AssessmentWorkflowContextType {
    currentAssessment: AssessmentData | null;
    workflowState: WorkflowState;
    loading: boolean;
    error: string | null;
    setCurrentAssessment: (assessment: AssessmentData) => void;
    performAction: (action: WorkflowAction) => Promise<boolean>;
    getAvailableActions: () => WorkflowAction[];
    clearError: () => void;
}

const AssessmentWorkflowContext = createContext<AssessmentWorkflowContextType | null>(null);

export const AssessmentWorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentAssessment, setCurrentAssessment] = useState<AssessmentData | null>(null);
    const [workflowState, setWorkflowState] = useState<WorkflowState>('draft');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const performAction = useCallback(async (action: WorkflowAction): Promise<boolean> => {
        if (!currentAssessment) {
            setError('No assessment selected');
            return false;
        }

        setLoading(true);
        try {
            const result = await assessmentWorkflowService.transitionWorkflow(
                currentAssessment,
                action
            );

            if (result.success && result.newState) {
                setWorkflowState(result.newState);
                setCurrentAssessment({
                    ...currentAssessment,
                    status: result.newState as any // TODO: Align types
                });
                return true;
            } else {
                setError(result.message || 'Workflow transition failed');
                return false;
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An unexpected error occurred');
            return false;
        } finally {
            setLoading(false);
        }
    }, [currentAssessment]);

    const getAvailableActions = useCallback((): WorkflowAction[] => {
        if (!currentAssessment) return [];
        return assessmentWorkflowService.getAvailableActions(currentAssessment);
    }, [currentAssessment]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const value = {
        currentAssessment,
        workflowState,
        loading,
        error,
        setCurrentAssessment,
        performAction,
        getAvailableActions,
        clearError,
    };

    return (
        <AssessmentWorkflowContext.Provider value={value}>
            {children}
        </AssessmentWorkflowContext.Provider>
    );
};

export const useAssessmentWorkflow = () => {
    const context = useContext(AssessmentWorkflowContext);
    if (!context) {
        throw new Error('useAssessmentWorkflow must be used within an AssessmentWorkflowProvider');
    }
    return context;
};
