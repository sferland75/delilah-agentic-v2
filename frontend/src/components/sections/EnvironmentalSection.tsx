import React from 'react';
import { HomeEnvironment } from '../../types/assessment';
import { cn } from '@/lib/utils';

interface Props {
  data?: HomeEnvironment;
  onChange: (value: HomeEnvironment) => void;
}

const EnvironmentalSection: React.FC<Props> = ({ data = {
  housingType: '',
  accessibility: '',
  safety: '',
  modifications: [],
  notes: '',
  access: '',
  layout: '',
  barriers: '',
  safetyRisks: [],
  equipment: [],
  homeSetup: '',
  supportSystems: ''
}, onChange }) => {
  const handleChange = (field: keyof HomeEnvironment, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const addListItem = (field: 'modifications' | 'safetyRisks' | 'equipment') => {
    const newItem = window.prompt(`Add new ${field.replace(/([A-Z])/g, ' $1').toLowerCase().trim()} item:`);
    if (newItem) {
      handleChange(field, [...(data[field] || []), newItem]);
    }
  };

  const removeListItem = (field: 'modifications' | 'safetyRisks' | 'equipment', index: number) => {
    const items = data[field] || [];
    handleChange(field, [...items.slice(0, index), ...items.slice(index + 1)]);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Housing Type</label>
        <input
          type="text"
          value={data.housingType}
          onChange={(e) => handleChange('housingType', e.target.value)}
          className={cn(
            "mt-1 block w-full rounded-md border-gray-300 shadow-sm",
            "focus:border-indigo-500 focus:ring-indigo-500"
          )}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Accessibility</label>
        <textarea
          value={data.accessibility}
          onChange={(e) => handleChange('accessibility', e.target.value)}
          rows={3}
          className={cn(
            "mt-1 block w-full rounded-md border-gray-300 shadow-sm",
            "focus:border-indigo-500 focus:ring-indigo-500"
          )}
          placeholder="Describe accessibility features and challenges..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Safety</label>
        <textarea
          value={data.safety}
          onChange={(e) => handleChange('safety', e.target.value)}
          rows={3}
          className={cn(
            "mt-1 block w-full rounded-md border-gray-300 shadow-sm",
            "focus:border-indigo-500 focus:ring-indigo-500"
          )}
          placeholder="Describe safety features and concerns..."
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Modifications</label>
          <button
            type="button"
            onClick={() => addListItem('modifications')}
            className="text-indigo-600 hover:text-indigo-900"
          >
            + Add Modification
          </button>
        </div>
        <div className="space-y-2">
          {(data.modifications || []).map((mod, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span>{mod}</span>
              <button
                type="button"
                onClick={() => removeListItem('modifications', index)}
                className="text-red-600 hover:text-red-900"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
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
          placeholder="Additional notes about the home environment..."
        />
      </div>
    </div>
  );
};

export default EnvironmentalSection;