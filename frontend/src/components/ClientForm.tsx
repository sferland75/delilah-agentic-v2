import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ClientFormData } from '../types/client';
import { clientService } from '../services/clientService';
import { useToast } from '../contexts/ToastContext';

const INITIAL_FORM_DATA: ClientFormData = {
  name: '',
  dateOfBirth: '',
  email: '',
  phone: '',
  address: '',
  emergencyContact: {
    name: '',
    relationship: '',
    phone: ''
  },
  medicalHistory: '',
  insuranceInfo: {
    provider: '',
    policyNumber: ''
  }
};

const ClientForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<ClientFormData>(INITIAL_FORM_DATA);
  const [isLoading, setIsLoading] = useState(id ? true : false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchClient = async () => {
      if (!id) return;
      try {
        const client = await clientService.getById(id);
        setFormData({
          name: client.name,
          dateOfBirth: client.dateOfBirth,
          email: client.email,
          phone: client.phone,
          address: client.address,
          emergencyContact: {
            name: client.emergencyContact.name,
            relationship: client.emergencyContact.relationship,
            phone: client.emergencyContact.phone
          },
          medicalHistory: client.medicalHistory,
          insuranceInfo: {
            provider: client.insuranceInfo.provider,
            policyNumber: client.insuranceInfo.policyNumber
          }
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load client');
        showToast('Failed to load client details', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClient();
  }, [id, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (id) {
        await clientService.update(id, formData);
        showToast('Client updated successfully', 'success');
      } else {
        await clientService.create(formData);
        showToast('Client created successfully', 'success');
      }
      navigate('/clients');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save client';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmergencyContactChange = (field: keyof typeof INITIAL_FORM_DATA.emergencyContact, value: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value
      }
    }));
  };

  const handleInsuranceChange = (field: keyof typeof INITIAL_FORM_DATA.insuranceInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      insuranceInfo: {
        ...prev.insuranceInfo,
        [field]: value
      }
    }));
  };

  if (isLoading) return <div className="p-6">Loading client details...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{id ? 'Edit Client' : 'Add New Client'}</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Emergency Contact</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.emergencyContact.name}
                onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Relationship</label>
              <input
                type="text"
                value={formData.emergencyContact.relationship}
                onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={formData.emergencyContact.phone}
                onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Medical History */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Medical History</h2>
          <textarea
            value={formData.medicalHistory}
            onChange={(e) => handleChange('medicalHistory', e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Insurance Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Insurance Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Provider</label>
              <input
                type="text"
                value={formData.insuranceInfo.provider}
                onChange={(e) => handleInsuranceChange('provider', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Policy Number</label>
              <input
                type="text"
                value={formData.insuranceInfo.policyNumber}
                onChange={(e) => handleInsuranceChange('policyNumber', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/clients')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? (id ? 'Saving...' : 'Creating...') : (id ? 'Save Changes' : 'Create Client')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;