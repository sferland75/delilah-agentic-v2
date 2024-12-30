import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AssessmentFormData, AssessmentType } from '../types/assessment';
import { assessmentService } from '../services/assessmentService';
import { useToast } from '../contexts/ToastContext';
import AssessmentForm from './AssessmentForm';
import LoadingSpinner from './LoadingSpinner';

export const INITIAL_CLIENT_INFO = {
    name: '',
    dateOfBirth: '',
    claimNumber: '',
    dateOfAccident: '',
    referralDate: '',
    gender: '',
    contact: '',
    address: '',
    insuranceInfo: '',
    emergencyContact: '',
    diagnosis: '',
    medicalHistory: '',
    medications: [],
};

export const INITIAL_FUNCTIONAL_STATUS = {
    mobility: '',
    selfCare: '',
    communication: '',
    cognition: '',
    transfers: '',
    homeManagement: '',
    communityAccess: '',
    notes: '',
};

export const INITIAL_HOME_ENVIRONMENT = {
    access: '',
    layout: '',
    barriers: '',
    safetyRisks: [],
    homeSetup: '',
    modifications: '',
    equipment: [],
    supportSystems: '',
};

const AssessmentEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [assessment, setAssessment] = useState<AssessmentFormData | null>(null);

    useEffect(() => {
        loadAssessment();
    }, [id]);

    const loadAssessment = async () => {
        try {
            if (id) {
                const data = await assessmentService.getById(id);
                setAssessment(data);
            }
        } catch (error) {
            console.error('Error loading assessment:', error);
            showToast('Failed to load assessment', 'error');
            navigate('/assessments');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!assessment) {
        return <div>Assessment not found</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Edit Assessment
                    </h2>
                </div>
            </div>
            <AssessmentForm initialData={assessment} />
        </div>
    );
};

export default AssessmentEdit;