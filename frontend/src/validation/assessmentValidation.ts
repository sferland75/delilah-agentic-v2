import { AssessmentFormData, AssessmentType, CoreAssessment } from '../types/assessment';

interface ValidationError {
    message: string;
    path?: string[];
}

export interface ValidationErrors {
    [key: string]: ValidationError[];
}

const validateClientInfo = (clientInfo: CoreAssessment['clientInfo']): ValidationError[] => {
    const errors: ValidationError[] = [];
    if (!clientInfo.demographics) {
        errors.push({
            message: 'Demographics information is required',
            path: ['clientInfo', 'demographics']
        });
    }
    return errors;
};

const validateFunctionalStatus = (status: CoreAssessment['functionalStatus']): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    if (!status.adl) {
        errors.push({
            message: 'ADL assessment is required',
            path: ['functionalStatus', 'adl']
        });
    }
    
    if (!status.mobility) {
        errors.push({
            message: 'Mobility assessment is required',
            path: ['functionalStatus', 'mobility']
        });
    }
    
    return errors;
};

const validateHomeEnvironment = (env: CoreAssessment['homeEnvironment']): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    if (!env.safety || env.safety.length === 0) {
        errors.push({
            message: 'At least one safety assessment is required',
            path: ['homeEnvironment', 'safety']
        });
    }
    
    return errors;
};

export const validateAssessmentForm = (data: AssessmentFormData): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Required fields validation
    if (!data.clientId) {
        errors.clientId = [{
            message: 'Client ID is required'
        }];
    }

    if (!data.assessmentType || !Object.values(AssessmentType).includes(data.assessmentType)) {
        errors.assessmentType = [{
            message: 'Valid assessment type is required'
        }];
    }

    // Core assessment validation
    if (data.core) {
        const clientInfoErrors = validateClientInfo(data.core.clientInfo);
        if (clientInfoErrors.length > 0) {
            errors.clientInfo = clientInfoErrors;
        }

        const functionalErrors = validateFunctionalStatus(data.core.functionalStatus);
        if (functionalErrors.length > 0) {
            errors.functionalStatus = functionalErrors;
        }

        const environmentErrors = validateHomeEnvironment(data.core.homeEnvironment);
        if (environmentErrors.length > 0) {
            errors.homeEnvironment = environmentErrors;
        }
    } else {
        errors.core = [{
            message: 'Assessment core data is required'
        }];
    }

    return errors;
};

export const isValid = (errors: ValidationErrors): boolean => {
    return Object.keys(errors).length === 0;
};

export const getErrorsForPath = (errors: ValidationErrors, path: string[]): ValidationError[] => {
    const result: ValidationError[] = [];
    
    Object.entries(errors).forEach(([key, fieldErrors]) => {
        fieldErrors.forEach(error => {
            if (!error.path || arraysEqual(error.path, path)) {
                result.push(error);
            }
        });
    });
    
    return result;
};

// Utility function to compare arrays
const arraysEqual = (a: any[], b: any[]): boolean => {
    return a.length === b.length && a.every((val, index) => val === b[index]);
};