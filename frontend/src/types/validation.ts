export interface ValidationRule {
    (value: any): boolean | string;
}

export interface ValidationErrors {
    [key: string]: string;
}

export interface SectionValidationRules {
    [key: string]: ValidationRule;
}

export interface AssessmentValidationRules {
    [section: string]: SectionValidationRules;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationErrors;
}

// Validation States
export interface ValidationState {
    isDirty: boolean;
    isValid: boolean;
    errors: ValidationErrors;
}

// Form Section States
export interface FormSectionState {
    data: any;
    validation: ValidationState;
}

// Form Management
export interface FormManagement {
    formData: any;
    errors: ValidationErrors;
    isDirty: boolean;
    updateField: (section: string, field: string, value: any) => void;
    validateForm: () => boolean;
    saveForm: () => Promise<boolean>;
}

export type ValidationFunction = (value: any) => boolean | string;

export interface ValidationSchema {
    [key: string]: {
        [field: string]: ValidationFunction;
    };
}