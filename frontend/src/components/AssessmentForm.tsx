import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Assessment, AssessmentFormData, AssessmentType } from '../types/assessment';
import { validateAssessmentForm, isValid } from '../validation/assessmentValidation';
import { ClientSelector } from './client/ClientSelector';
import { useToast } from '../contexts/ToastContext';
import { assessmentService } from '../services/assessmentService';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const INITIAL_FORM_DATA: AssessmentFormData = {
  clientId: '',
  type: 'initial',
  status: 'draft',
  emergencyContact: {
    name: '',
    relationship: '',
    phone: ''
  },
  clinicalInfo: {
    diagnosis: '',
    medicalHistory: '',
    medications: [],
    allergies: []
  },
  functionalStatus: {
    mobility: '',
    selfCare: '',
    communication: '',
    cognition: '',
    transfers: '',
    homeManagement: '',
    communityAccess: '',
    social: '',
    notes: ''
  },
  homeEnvironment: {
    safetyRisks: [],
    homeSetup: '',
    modifications: [],
    equipment: [],
    supportSystems: ''
  },
  recommendations: {
    immediate: [],
    shortTerm: [],
    longTerm: [],
    equipment: [],
    services: [],
    modifications: [],
    followUp: '',
    notes: ''
  }
};

const AssessmentForm: React.FC = () => {
  const [formData, setFormData] = useState<AssessmentFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateAssessmentForm(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const result = await assessmentService.create(formData);
      toast({
        title: 'Success',
        description: 'Assessment created successfully'
      });
      navigate(`/assessments/${result.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create assessment',
        variant: 'destructive'
      });
    }
  };

  const handleInputChange = (field: keyof AssessmentFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for the field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Client</label>
              <ClientSelector
                value={formData.clientId}
                onChange={(value) => handleInputChange('clientId', value)}
              />
              {errors.clientId && (
                <p className="text-sm text-red-500 mt-1">{errors.clientId.join(', ')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Assessment Type</label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="initial">Initial</SelectItem>
                  <SelectItem value="followUp">Follow-up</SelectItem>
                  <SelectItem value="discharge">Discharge</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500 mt-1">{errors.type.join(', ')}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/assessments')}
            >
              Cancel
            </Button>
            <Button type="submit">Create Assessment</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AssessmentForm;