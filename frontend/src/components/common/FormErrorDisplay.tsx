import React from 'react';
import { ValidationErrors, ValidationError, getErrorsForPath } from '@/validation/assessmentValidation';

interface FormErrorDisplayProps {
    errors: ValidationErrors;
    path?: string[];
    className?: string;
}

export const FormErrorDisplay: React.FC<FormErrorDisplayProps> = ({
    errors,
    path = [],
    className = ''
}) => {
    const relevantErrors = path.length > 0 ? getErrorsForPath(errors, path) : 
        Object.values(errors).flat();

    if (relevantErrors.length === 0) return null;

    return (
        <div className={`mt-1 text-sm text-red-600 ${className}`}>
            {relevantErrors.map((error: ValidationError, index: number) => (
                <div key={index} className="flex items-start space-x-1">
                    <span className="mt-0.5">•</span>
                    <span>{error.message}</span>
                </div>
            ))}
        </div>
    );
};

// Helper hook for form errors
export const useFormError = (errors: ValidationErrors, path: string[]) => {
    const hasError = React.useMemo(() => {
        const pathErrors = getErrorsForPath(errors, path);
        return pathErrors.length > 0;
    }, [errors, path]);

    const getErrorMessage = React.useCallback(() => {
        const pathErrors = getErrorsForPath(errors, path);
        return pathErrors.map(e => e.message).join(', ');
    }, [errors, path]);

    return {
        hasError,
        getErrorMessage
    };
};