import React from 'react';
import { ClientInfo } from '../../types/assessment';
import { cn } from '@/lib/utils';

interface Props {
  data?: ClientInfo;
  onChange: (value: ClientInfo) => void;
}

export const DemographicSection: React.FC<Props> = ({ data = {
  name: '',
  dateOfBirth: '',
  address: '',
  phone: '',
  email: '',
  emergencyContact: {
    name: '',
    relationship: '',
    phone: ''
  }
}, onChange }) => {
  const handleChange = (field: keyof ClientInfo, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const handleEmergencyContactChange = (field: keyof typeof data.emergencyContact, value: string) => {
    onChange({
      ...data,
      emergencyContact: {
        ...data.emergencyContact,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={cn(
            "mt-1 block w-full rounded-md border-gray-300 shadow-sm",
            "focus:border-indigo-500 focus:ring-indigo-500"
          )}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
        <input
          type="date"
          value={data.dateOfBirth}
          onChange={(e) => handleChange('dateOfBirth', e.target.value)}
          className={cn(
            "mt-1 block w-full rounded-md border-gray-300 shadow-sm",
            "focus:border-indigo-500 focus:ring-indigo-500"
          )}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <input
          type="text"
          value={data.address}
          onChange={(e) => handleChange('address', e.target.value)}
          className={cn(
            "mt-1 block w-full rounded-md border-gray-300 shadow-sm",
            "focus:border-indigo-500 focus:ring-indigo-500"
          )}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <input
          type="tel"
          value={data.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          className={cn(
            "mt-1 block w-full rounded-md border-gray-300 shadow-sm",
            "focus:border-indigo-500 focus:ring-indigo-500"
          )}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className={cn(
            "mt-1 block w-full rounded-md border-gray-300 shadow-sm",
            "focus:border-indigo-500 focus:ring-indigo-500"
          )}
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={data.emergencyContact.name}
              onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
              className={cn(
                "mt-1 block w-full rounded-md border-gray-300 shadow-sm",
                "focus:border-indigo-500 focus:ring-indigo-500"
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Relationship</label>
            <input
              type="text"
              value={data.emergencyContact.relationship}
              onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
              className={cn(
                "mt-1 block w-full rounded-md border-gray-300 shadow-sm",
                "focus:border-indigo-500 focus:ring-indigo-500"
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={data.emergencyContact.phone}
              onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
              className={cn(
                "mt-1 block w-full rounded-md border-gray-300 shadow-sm",
                "focus:border-indigo-500 focus:ring-indigo-500"
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemographicSection;