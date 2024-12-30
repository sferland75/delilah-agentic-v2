import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AssessmentFormData, AssessmentType } from '../../types/assessment';
import { useAssessmentAgent } from '../../contexts/AssessmentAgentContext';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Alert, AlertDescription } from '../ui/alert';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Save, AlertCircle } from 'lucide-react';
import { createEmptyAssessmentData } from '../../utils/assessment';
import BaseForm from './form/BaseForm';
import SectionWrapper from './form/SectionWrapper';
import AgentInsightsPanel from './AgentInsightsPanel';
import { assessmentService } from '../../services/assessmentService';

export default function AssessmentContainer() {
    const { id } = useParams<{ id: string }>();
    const [activeTab, setActiveTab] = useState('assessment');
    const [formData, setFormData] = useState<AssessmentFormData>(createEmptyAssessmentData());
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const { addToast } = useToast();
    const agent = useAssessmentAgent();

    React.useEffect(() => {
        if (id) {
            loadAssessment();
        }
    }, [id]);

    const loadAssessment = async () => {
        try {
            setLoading(true);
            const data = await assessmentService.get(id);
            if (data) {
                setFormData(data);
            }
        } catch (error) {
            addToast('Error loading assessment', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            if (id) {
                await assessmentService.update(id, formData);
            } else {
                await assessmentService.create(formData);
            }
            addToast('Assessment saved successfully', { variant: 'success' });
        } catch (error) {
            addToast('Error saving assessment', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleTypeChange = (type: AssessmentType) => {
        setFormData(prev => ({
            ...prev,
            assessmentType: type,
            form1: type === AssessmentType.IHA_FORM1 ? createEmptyAssessmentData().form1 : null,
            cat: type === AssessmentType.IHA_CAT || type === AssessmentType.IHA_CAT_SIT ? createEmptyAssessmentData().cat : null
        }));
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <TabsList>
                    <TabsTrigger value="assessment">Assessment</TabsTrigger>
                    <TabsTrigger value="insights">Agent Insights</TabsTrigger>
                </TabsList>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {loading ? (
                        <LoadingSpinner size="sm" />
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save
                        </>
                    )}
                </button>
            </div>

            {errors.length > 0 && (
                <Alert variant="error" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <ul className="list-disc pl-5">
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            <TabsContent value="assessment">
                <Card>
                    <BaseForm
                        formData={formData}
                        onFormChange={setFormData}
                    >
                        <SectionWrapper title="Assessment Type">
                            <select
                                value={formData.assessmentType}
                                onChange={(e) => handleTypeChange(e.target.value as AssessmentType)}
                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value={AssessmentType.BASIC_IHA}>Basic In-Home Assessment</option>
                                <option value={AssessmentType.IHA_FORM1}>Form 1 Assessment</option>
                                <option value={AssessmentType.IHA_CAT}>CAT Assessment</option>
                                <option value={AssessmentType.IHA_CAT_SIT}>CAT with Situational</option>
                            </select>
                        </SectionWrapper>
                    </BaseForm>
                </Card>
            </TabsContent>

            <TabsContent value="insights">
                <AgentInsightsPanel agent={agent} />
            </TabsContent>
        </Tabs>
    );
}