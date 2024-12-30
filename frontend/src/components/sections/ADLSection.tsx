import React from 'react';
import { FunctionalStatus } from '../../types/assessment';
import { cn } from '@/lib/utils';

interface Props {
  data?: FunctionalStatus;
  onChange: (value: FunctionalStatus) => void;
}

const ADLSection: React.FC<Props> = ({ data = {
  mobility: '',
  selfCare: '',
  communication: '',
  transfers: '',
  social: '',
  notes: '',
  cognition: '',
  homeManagement: '',
  communityAccess: ''
}, onChange }) => {
  const handleChange = (field: keyof FunctionalStatus, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Mobility</label>
        <textarea
          value={data.mobility}
          onChange={(e) => handleChange('mobility', e.target.value)}
          rows={3}
          className={cn(
            "mt-1 block w-full rounded-md border-gray-300 shadow-sm",
            "focus:border-indigo-500 focus:ring-indigo-500"
          )}
          placeholder="Describe mobility status and any aids used..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Self Care</label>
        <textarea
          value={data.selfCare}
          onChange={(e) => handleChange('selfCare', e.target.value)}
          rows={3}
          className={cn(
            "mt-1 block w-full rounded-md border-gray-300 shadow-sm",
            "focus:border-indigo-500 focus:ring-indigo-500"
          )}
          placeholder="Describe ability to perform self-care activities..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Communication</label>
        <textarea
          value={data.communication}
          onChange={(e) => handleChange('communication', e.target.value)}
          rows={3}
          className={cn(
            "mt-1 block w-full rounded-md border-gray-300 shadow-sm",
            "focus:border-indigo-500 focus:ring-indigo-500"
          )}
          placeholder="Describe communication abilities and challenges..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cognition</label>
        <textarea
          value={data.cognition}
          onChange={(e) => handleChange('cognition', e.target.value)}
          rows={3}
          className={cn(
            "mt-1 block w-full rounded-md border-gray-300 shadow-sm",
            "focus:border-indigo-500 focus:ring-indigo-500"
          )}
          placeholder="Describe cognitive function and any impairments..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Transfers</label>
        <textarea
          value={data.transfers}
          onChange={(e) => handleChange('transfers', e.target.value)}
          rows={3}
          className={cn(
            "mt-1 block w-full rounded-md border-gray-300 shadow-sm",
            "focus:border-indigo-500 focus:ring-indigo-500"
          )}
          placeholder="Describe ability to perform transfers..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Social Interaction</label>
        <textarea
          value={data.social}
          onChange={(e) => handleChange('social', e.target.value)}
          rows={3}
          className={cn(
            "mt-1 block w-full rounded-md border-gray-300 shadow-sm",
            "focus:border-indigo-500 focus:ring-indigo-500"
          )}
          placeholder="Describe social interaction and participation..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          value={data.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
          className={cn(
            "mt-1 block w-full rounded-md border-gray-300 shadow-sm",
            "focus:border-indigo-500 focus:ring-indigo-500"
          )}
          placeholder="Additional notes about functional status..."
        />
      </div>
    </div>
  );
};

export default ADLSection;