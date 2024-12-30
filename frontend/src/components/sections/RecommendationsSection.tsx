import React from 'react';
import { Recommendations } from '../../types/assessment';
import { cn } from '@/lib/utils';

interface Props {
  data?: Recommendations;
  onChange: (value: Recommendations) => void;
}

const RecommendationsSection: React.FC<Props> = ({ data = {
  equipment: [],
  services: [],
  modifications: [],
  followUp: '',
  notes: '',
  immediate: [],
  shortTerm: [],
  longTerm: []
}, onChange }) => {
  const handleChange = (field: keyof Recommendations, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const addItem = (field: keyof Recommendations) => {
    if (field === 'followUp' || field === 'notes') return;
    const newItem = window.prompt(`Add new ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} item:`);
    if (newItem) {
      handleChange(field, [...(data[field] as string[]), newItem]);
    }
  };

  const removeItem = (field: keyof Recommendations, index: number) => {
    if (field === 'followUp' || field === 'notes') return;
    const items = data[field] as string[];
    handleChange(field, [...items.slice(0, index), ...items.slice(index + 1)]);
  };

  return (
    <div className="space-y-6">
      {['equipment', 'services', 'modifications'].map((field) => (
        <div key={field}>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 capitalize">
              {field}
            </label>
            <button
              type="button"
              onClick={() => addItem(field as keyof Recommendations)}
              className="text-indigo-600 hover:text-indigo-900"
            >
              + Add Item
            </button>
          </div>
          <div className="space-y-2">
            {(data[field as keyof Recommendations] as string[]).map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => removeItem(field as keyof Recommendations, index)}
                  className="text-red-600 hover:text-red-900"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium text-gray-700">Follow Up Plan</label>
        <textarea
          value={data.followUp}
          onChange={(e) => handleChange('followUp', e.target.value)}
          rows={3}
          className={cn(
            "mt-1 block w-full rounded-md border-gray-300 shadow-sm",
            "focus:border-indigo-500 focus:ring-indigo-500"
          )}
          placeholder="Describe follow-up plans and timeline..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
        <textarea
          value={data.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
          className={cn(
            "mt-1 block w-full rounded-md border-gray-300 shadow-sm",
            "focus:border-indigo-500 focus:ring-indigo-500"
          )}
          placeholder="Additional notes or recommendations..."
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline-based Recommendations</h3>

        {['immediate', 'shortTerm', 'longTerm'].map((field) => (
          <div key={field} className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 capitalize">
                {field.replace(/([A-Z])/g, ' $1')} Actions
              </label>
              <button
                type="button"
                onClick={() => addItem(field as keyof Recommendations)}
                className="text-indigo-600 hover:text-indigo-900"
              >
                + Add Item
              </button>
            </div>
            <div className="space-y-2">
              {(data[field as keyof Recommendations] as string[]).map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(field as keyof Recommendations, index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationsSection;