import { AssessmentData, AssessmentType } from '../types/assessment';

export type WorkflowState = 'draft' | 'pending_review' | 'in_review' | 'revision_required' | 'completed';
export type WorkflowAction = 'save_draft' | 'submit_review' | 'approve' | 'request_revision' | 'complete';

export interface WorkflowTransition {
    from: WorkflowState;
    to: WorkflowState;
    action: WorkflowAction;
    requiredFields: string[];
    validationRules?: Record<string, (value: any) => boolean>;
}

const workflowTransitions: WorkflowTransition[] = [
    {
        from: 'draft',
        to: 'pending_review',
        action: 'submit_review',
        requiredFields: ['clientId', 'assessmentType', 'dateTime', 'location', 'core'],
    },
    {
        from: 'pending_review',
        to: 'in_review',
        action: 'approve',
        requiredFields: [],
    },
    {
        from: 'in_review',
        to: 'revision_required',
        action: 'request_revision',
        requiredFields: ['observations'],
    },
    {
        from: 'revision_required',
        to: 'pending_review',
        action: 'submit_review',
        requiredFields: [],
    },
    {
        from: 'in_review',
        to: 'completed',
        action: 'complete',
        requiredFields: [],
    },
];

export class AssessmentWorkflowService {
    private validateRequiredFields(assessment: AssessmentData, requiredFields: string[]): boolean {
        return requiredFields.every(field => {
            // Handle nested paths safely with type checking
            const value = field.split('.').reduce((obj: any, key: string) => {
                return obj && typeof obj === 'object' ? obj[key] : undefined;
            }, assessment as any);

            if (typeof value === 'string') {
                return value.trim() !== '';
            } else if (Array.isArray(value)) {
                return value.length > 0;
            } else if (typeof value === 'object') {
                return value !== null;
            }
            return value !== undefined && value !== null;
        });
    }

    getAvailableActions(assessment: AssessmentData): WorkflowAction[] {
        return workflowTransitions
            .filter(transition => transition.from === assessment.status)
            .map(transition => transition.action);
    }

    async transitionWorkflow(
        assessment: AssessmentData,
        action: WorkflowAction
    ): Promise<{ success: boolean; message?: string; newState?: WorkflowState }> {
        const transition = workflowTransitions.find(
            t => t.from === assessment.status && t.action === action
        );

        if (!transition) {
            return {
                success: false,
                message: `Invalid transition: Cannot perform ${action} from ${assessment.status}`,
            };
        }

        if (!this.validateRequiredFields(assessment, transition.requiredFields)) {
            return {
                success: false,
                message: `Required fields missing for ${action}: ${transition.requiredFields.join(', ')}`,
            };
        }

        // Assessment type specific validation
        switch (assessment.assessmentType) {
            case AssessmentType.IHA_FORM1:
                if (!assessment.form1) {
                    return {
                        success: false,
                        message: 'Form1 assessment data is required',
                    };
                }
                break;
            case AssessmentType.IHA_CAT:
                if (!assessment.cat) {
                    return {
                        success: false,
                        message: 'CAT assessment data is required',
                    };
                }
                break;
        }

        // In a real implementation, you would make an API call here
        // For now, we'll just return the new state
        return {
            success: true,
            newState: transition.to,
        };
    }

    getRequiredFields(assessment: AssessmentData, action: WorkflowAction): string[] {
        const transition = workflowTransitions.find(
            t => t.from === assessment.status && t.action === action
        );
        return transition?.requiredFields || [];
    }
}

export const assessmentWorkflowService = new AssessmentWorkflowService();
