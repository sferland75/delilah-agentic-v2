import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    AssessmentFormData, 
    AssessmentType, 
    ClientInfo, 
    FunctionalStatus, 
    HomeEnvironment 
} from '../../types/assessment';
import { assessmentService } from '../../services/assessmentService';
import { useToast } from '../../contexts/ToastContext';
import ClientSelector from './clients/ClientSelector';
import LoadingSpinner from '../common/LoadingSpinner';

export const INITIAL_CLIENT_INFO: ClientInfo = {
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
    medications: []
};

export const INITIAL_FUNCTIONAL_STATUS: FunctionalStatus = {
    mobility: '',
    selfCare: '',
    communication: '',
    cognition: '',
    transfers: '',
    homeManagement: '',
    communityAccess: '',
    notes: ''
};

export const INITIAL_HOME_ENVIRONMENT: HomeEnvironment = {
    access: '',
    layout: '',
    barriers: '',
    safetyRisks: [],
    homeSetup: '',
    modifications: '',
    equipment: [],
    supportSystems: ''
};

const INITIAL_FORM_DATA: AssessmentFormData = {
    clientId: '',
    assessmentType: AssessmentType.BASIC_IHA,
    dateTime: new Date().toISOString().slice(0, 16),
    location: '',
    core: {
        clientInfo: INITIAL_CLIENT_INFO,
        functionalStatus: INITIAL_FUNCTIONAL_STATUS,
        homeEnvironment: INITIAL_HOME_ENVIRONMENT,
        recommendations: {
            immediate: [],
            shortTerm: [],
            longTerm: []
        }
    },
    primaryConcerns: '',
    goals: [],
    observations: '',
    measurements: {}
};

const AssessmentEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<AssessmentFormData>(INITIAL_FORM_DATA);
    const [activeSection, setActiveSection] = useState('demographics');

    useEffect(() => {
        const fetchAssessment = async () => {
            setIsLoading(true);
            try {
                if (!id) throw new Error('Assessment ID is required');
                const assessment = await assessmentService.getById(id);
                setFormData(assessment);
            } catch (error) {
                console.error('Error fetching assessment:', error);
                showToast('Failed to load assessment', 'error');
                navigate('/assessments');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchAssessment();
        } else {
            setIsLoading(false);
        }
    }, [id, showToast, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (id) {
                await assessmentService.update(id, formData);
                showToast('Assessment updated successfully', 'success');
            } else {
                await assessmentService.create(formData);
                showToast('Assessment created successfully', 'success');
            }
            navigate('/assessments');
        } catch (error) {
            console.error('Error saving assessment:', error);
            showToast('Failed to save assessment', 'error');
        }
    };

    const handleChange = (field: keyof AssessmentFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h1 className="text-xl font-semibold mb-4">
                            {id ? 'Edit Assessment' : 'New Assessment'}
                        </h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Client
                                </label>
                                <ClientSelector
                                    value={formData.clientId}
                                    onChange={(value) => handleChange('clientId', value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Assessment Type
                                </label>
                                <select
                                    value={formData.assessmentType}
                                    onChange={(e) => handleChange('assessmentType', e.target.value as AssessmentType)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                >
                                    <option value={AssessmentType.BASIC_IHA}>Basic In-Home Assessment</option>
                                    <option value={AssessmentType.IHA_FORM1}>Form 1 Assessment</option>
                                    <option value={AssessmentType.IHA_CAT}>CAT Assessment</option>
                                    <option value={AssessmentType.IHA_CAT_SIT}>CAT with Situational</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Date & Time
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.dateTime}
                                    onChange={(e) => handleChange('dateTime', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => handleChange('location', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Primary Concerns
                            </label>
                            <textarea
                                value={formData.primaryConcerns}
                                onChange={(e) => handleChange('primaryConcerns', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                        <button
                            type="button"
                            onClick={() => navigate('/assessments')}
                            className="mr-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {id ? 'Save Changes' : 'Create Assessment'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AssessmentEdit;