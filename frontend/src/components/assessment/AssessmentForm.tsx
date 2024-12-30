import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssessmentFormData, AssessmentType } from '../../types/assessment';
import { createEmptyAssessmentData } from '../../utils/assessment';
import { validateAssessmentForm, isValid } from '../../validation/assessmentValidation';
import { ClientSelector } from '../client/ClientSelector';
import { useToast } from '../toast';
import { assessmentService } from '../../services/assessmentService';
import { 
  DemographicSection, 
  ADLSection, 
  EnvironmentalSection,
  RecommendationsSection 
} from './sections';

const SECTIONS = [
  { id: 'demographics', label: 'Demographics' },
  { id: 'functional', label: 'Functional Status' },
  { id: 'environmental', label: 'Environmental' },
  { id: 'recommendations', label: 'Recommendations' }
];

export const AssessmentForm: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [formData, setFormData] = useState<AssessmentFormData>(createEmptyAssessmentData());
  const [activeSection, setActiveSection] = useState('demographics');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateAssessmentForm(formData);
    
    if (!isValid(validationErrors)) {
      addToast('Please fix validation errors', { variant: 'error' });
      setErrors(validationErrors);
      return;
    }

    try {
      await assessmentService.create(formData);
      addToast('Assessment created', { variant: 'success' });
      navigate('/assessments');
    } catch (error) {
      console.error('Error creating assessment:', error);
      addToast('Failed to create assessment', { variant: 'error' });
    }
  };

  const updateFormData = (key: keyof AssessmentFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateCoreData = (section: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      core: {
        ...prev.core!,
        [section]: value
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">New Assessment</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Assessment Type
              </label>
              <select
                value={formData.assessmentType}
                onChange={(e) => updateFormData('assessmentType', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                {Object.values(AssessmentType).map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              {errors.assessmentType && (
                <p className="mt-1 text-sm text-red-600">{errors.assessmentType}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Client</label>
              <ClientSelector
                value={formData.clientId || ''}
                onChange={(value) => updateFormData('clientId', value)}
                required
              />
              {errors.clientId && (
                <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {SECTIONS.map(section => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    px-3 py-2 font-medium text-sm rounded-t-lg
                    ${activeSection === section.id
                      ? 'border-indigo-500 text-indigo-600 border-b-2'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-6">
            {/* Section Content */}
            {activeSection === 'demographics' && (
              <DemographicSection
                data={formData.core?.clientInfo}
                onChange={(value) => updateCoreData('clientInfo', value)}
              />
            )}

            {activeSection === 'functional' && (
              <ADLSection
                data={formData.core?.functionalStatus}
                onChange={(value) => updateCoreData('functionalStatus', value)}
              />
            )}

            {activeSection === 'environmental' && (
              <EnvironmentalSection
                data={formData.core?.homeEnvironment}
                onChange={(value) => updateCoreData('homeEnvironment', value)}
              />
            )}

            {activeSection === 'recommendations' && (
              <RecommendationsSection
                data={formData.core?.recommendations}
                onChange={(value) => updateCoreData('recommendations', value)}
              />
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/assessments')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Assessment
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssessmentForm;