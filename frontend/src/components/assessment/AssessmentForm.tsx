import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { validateAssessment, ValidationError } from '../../utils/validation';
import { assessmentService } from '../../services/assessmentService';
import { Toast } from '../common/Toast';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface AssessmentData {
    type: 'initial' | 'followUp' | 'discharge';
    clientInfo: {
        name: string;
        dateOfBirth: string;
    };
    functionalStatus: {
        mobility: string;
        adl: string;
        iadl: string;
    };
    environment: {
        homeSetup: string;
        safetyRisks: string[];
    };
}

const initialData: AssessmentData = {
    type: 'initial',
    clientInfo: {
        name: '',
        dateOfBirth: ''
    },
    functionalStatus: {
        mobility: '',
        adl: '',
        iadl: ''
    },
    environment: {
        homeSetup: '',
        safetyRisks: []
    }
};

const AssessmentForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEditMode = Boolean(id);

    const [activeSection, setActiveSection] = useState<string>('basic');
    const [formData, setFormData] = useState<AssessmentData>(initialData);
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Fetch existing assessment data if in edit mode
    const { data: existingAssessment, isLoading: isLoadingAssessment } = useQuery({
        queryKey: ['assessment', id],
        queryFn: () => assessmentService.getById(id!),
        enabled: isEditMode,
    });

    // Update form data when existing assessment is loaded
    useEffect(() => {
        if (existingAssessment) {
            setFormData(existingAssessment);
        }
    }, [existingAssessment]);

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: AssessmentData) => assessmentService.create(data),
        onSuccess: () => {
            setToast({ message: 'Assessment created successfully', type: 'success' });
            navigate('/assessments');
        },
        onError: () => {
            setToast({ message: 'Failed to create assessment', type: 'error' });
        }
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: AssessmentData) => assessmentService.update(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessment', id] });
            setToast({ message: 'Assessment updated successfully', type: 'success' });
            navigate(`/assessments/${id}`);
        },
        onError: () => {
            setToast({ message: 'Failed to update assessment', type: 'error' });
        }
    });

    const isSaving = createMutation.isPending || updateMutation.isPending;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const validationErrors = validateAssessment(formData);
        setErrors(validationErrors);
        
        if (validationErrors.length > 0) {
            setToast({
                message: 'Please fix the errors before submitting',
                type: 'error'
            });
            return;
        }

        if (isEditMode) {
            updateMutation.mutate(formData);
        } else {
            createMutation.mutate(formData);
        }
    };

    if (isEditMode && isLoadingAssessment) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner className="w-8 h-8 text-blue-600" />
            </div>
        );
    }

    // Rest of the component (JSX) stays the same but with updated props
    // ... [Previous JSX code] ...

    return (
        <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header with conditional rendering */}
                <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-medium leading-6 text-gray-900">
                            {isEditMode ? 'Edit Assessment' : 'New Assessment'}
                        </h2>
                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={() => navigate('/assessments')}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Rest of the form sections */}
                {/* ... [Previous section code] ... */}
            </form>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default AssessmentForm;