import { Assessment, AssessmentFormData } from '../types/assessment';

interface ValidationErrors {
    [key: string]: string[];
}

export const validateAssessmentForm = (data: AssessmentFormData): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Required fields validation
    if (!data.clientId) {
        errors.clientId = ['Client ID is required'];
    }

    if (!data.type) {
        errors.type = ['Assessment type is required'];
    }

    // Emergency Contact validation
    if (!data.emergencyContact.name) {
        errors.emergencyContact = [...(errors.emergencyContact || []), 'Emergency contact name is required'];
    }
    if (!data.emergencyContact.phone) {
        errors.emergencyContact = [...(errors.emergencyContact || []), 'Emergency contact phone is required'];
    }

    // Clinical Info validation
    if (!data.clinicalInfo.diagnosis) {
        errors.clinicalInfo = [...(errors.clinicalInfo || []), 'Diagnosis is required'];
    }

    return errors;
};

export const isValid = (data: Assessment | AssessmentFormData): boolean => {
    const errors = validateAssessmentForm(data);
    return Object.keys(errors).length === 0;
};