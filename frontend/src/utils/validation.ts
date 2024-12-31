export interface ValidationError {
    field: string;
    message: string;
}

export function validateAssessment(data: any): ValidationError[] {
    const errors: ValidationError[] = [];

    // Required fields validation
    if (!data.type) {
        errors.push({ field: 'type', message: 'Assessment type is required' });
    }

    if (!data.clientInfo?.name) {
        errors.push({ field: 'clientInfo.name', message: 'Client name is required' });
    }

    if (!data.clientInfo?.dateOfBirth) {
        errors.push({ field: 'clientInfo.dateOfBirth', message: 'Date of birth is required' });
    }

    // Functional status validation
    if (!data.functionalStatus?.mobility?.trim()) {
        errors.push({ field: 'functionalStatus.mobility', message: 'Mobility assessment is required' });
    }

    return errors;
}