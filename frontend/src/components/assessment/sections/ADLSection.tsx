import React from 'react';
import { FunctionalStatus } from '../../../types/assessment';

interface Props {
  data?: FunctionalStatus;
  onChange: (data: FunctionalStatus) => void;
}

const ADLSection: React.FC<Props> = ({ data, onChange }) => {
  if (!data) return null;
  
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Mobility</label>
        <textarea
          value={data.mobility}
          onChange={(e) => onChange({ ...data, mobility: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Self Care</label>
        <textarea
          value={data.selfCare}
          onChange={(e) => onChange({ ...data, selfCare: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Communication</label>
        <textarea
          value={data.communication}
          onChange={(e) => onChange({ ...data, communication: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Transfers</label>
        <textarea
          value={data.transfers}
          onChange={(e) => onChange({ ...data, transfers: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cognition</label>
        <textarea
          value={data.cognition}
          onChange={(e) => onChange({ ...data, cognition: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          value={data.notes}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={3}
        />
      </div>
    </div>
  );
};

export default ADLSection;