import { useState, useCallback } from 'react';
import { AssessmentFormData, AssessmentType, AssessmentStatus } from '../types/assessment';
import { createEmptyAssessmentData } from '../utils/assessment';
import { validateAssessmentForm } from '../validation/assessmentValidation';

interface ValidationErrors {
    [key: string]: string;
}

export const useAssessmentForm = (initialData?: Partial<AssessmentFormData>) => {
    const [formData, setFormData] = useState<AssessmentFormData>({
        ...createEmptyAssessmentData(),
        ...initialData,
        status: AssessmentStatus.DRAFT
    });
    const [errors, setErrors] = useState<ValidationErrors>({});

    const updateFormData = useCallback((key: keyof AssessmentFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    const updateField = useCallback((path: string[], value: any) => {
        setFormData(prev => {
            const newData = { ...prev };
            let current: any = newData;
            
            for (let i = 0; i < path.length - 1; i++) {
                if (!current[path[i]]) {
                    current[path[i]] = {};
                }
                current = current[path[i]];
            }
            
            current[path[path.length - 1]] = value;
            return newData;
        });
    }, []);

    const validateForm = useCallback(() => {
        const validationErrors = validateAssessmentForm(formData);
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    }, [formData]);

    return {
        formData,
        errors,
        setFormData,
        updateFormData,
        updateField,
        validateForm
    };
};

export default useAssessmentForm;