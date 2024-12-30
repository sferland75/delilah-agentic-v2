import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Client } from '../types/client';
import { clientService } from '../services/clientService';
import { useToast } from '../contexts/ToastContext';

const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchClient = async () => {
      try {
        if (!id) return;
        const data = await clientService.getById(id);
        setClient(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load client');
        showToast('Failed to load client details', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClient();
  }, [id, showToast]);

  if (isLoading) return <div className="p-6">Loading client details...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!client) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{client.name}</h1>
        <div className="space-x-4">
          <button
            onClick={() => navigate(`/clients/${id}/edit`)}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit Client
          </button>
          <button
            onClick={() => navigate('/clients')}
            className="text-gray-600 hover:text-gray-800"
          >
            Back to Clients
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Basic Information */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Date of Birth</p>
              <p className="font-medium">{new Date(client.dateOfBirth).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-medium capitalize">{client.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{client.email || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{client.phone || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        {client.emergencyContact && (
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold mb-4">Emergency Contact</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{client.emergencyContact.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Relationship</p>
                <p className="font-medium">{client.emergencyContact.relationship}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{client.emergencyContact.phone}</p>
              </div>
            </div>
          </div>
        )}

        {/* Medical History */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4">Medical History</h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {client.medicalHistory || 'No medical history recorded'}
          </p>
        </div>

        {/* Insurance Information */}
        {client.insuranceInfo && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Insurance Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Provider</p>
                <p className="font-medium">{client.insuranceInfo.provider}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Policy Number</p>
                <p className="font-medium">{client.insuranceInfo.policyNumber}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex justify-end space-x-4">
        <button
          onClick={() => navigate(`/assessments/new?clientId=${client.id}`)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          New Assessment
        </button>
        <button
          onClick={() => navigate(`/clients/${id}/history`)}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          View History
        </button>
      </div>
    </div>
  );
};

export default ClientDetail;