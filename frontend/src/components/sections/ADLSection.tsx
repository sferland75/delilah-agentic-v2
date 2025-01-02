import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ADLSectionProps {
  data?: any;
  onUpdate?: (data: any) => void;
}

const categories = [
  {
    id: 'selfCare',
    label: 'Self Care',
    activities: ['Hygiene', 'Bathing', 'Dressing', 'Grooming', 'Toileting', 'Feeding', 'Medication']
  },
  {
    id: 'mobility',
    label: 'Mobility',
    activities: ['Walking', 'Transfers', 'Stairs', 'Balance', 'Lifting', 'Bending']
  },
  {
    id: 'homeLife',
    label: 'Home Life',
    activities: ['Meal Prep', 'Cleaning', 'Laundry', 'Shopping', 'Home Maintenance', 'Yard Work']
  },
  {
    id: 'community',
    label: 'Community',
    activities: ['Driving', 'Public Transit', 'Shopping', 'Banking', 'Appointments']
  },
  {
    id: 'productivity',
    label: 'Productivity',
    activities: ['Work', 'Education', 'Volunteering', 'Caregiving']
  },
  {
    id: 'leisure',
    label: 'Leisure',
    activities: ['Sports', 'Hobbies', 'Reading', 'Computer Use', 'Travel', 'Socializing']
  },
  {
    id: 'rest',
    label: 'Rest & Sleep',
    activities: ['Nighttime Sleep', 'Napping', 'Bed Mobility', 'Sleep Routine']
  }
];

export default function ADLSection({ data = {}, onUpdate }: ADLSectionProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);

  const handleChange = (activity: string, field: string, value: string) => {
    if (onUpdate) {
      onUpdate({
        ...data,
        [activity.toLowerCase()]: {
          ...data[activity.toLowerCase()],
          [field]: value
        }
      });
    }
  };

  const currentCategory = categories.find(c => c.id === activeCategory);

  return (
    <div>
      <div>
        <h2 className="text-lg font-medium">ADL Assessment</h2>
        <p className="text-sm text-gray-500">Assess activities of daily living capabilities</p>
      </div>

      <div className="flex space-x-1 border-b mt-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors focus:outline-none ${
              activeCategory === category.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto border rounded-lg mt-6">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-2 text-sm font-medium text-gray-500 uppercase">Activity</th>
              <th className="text-left px-4 py-2 text-sm font-medium text-gray-500 uppercase">Level of Independence</th>
              <th className="text-left px-4 py-2 text-sm font-medium text-gray-500 uppercase">Required Assistance</th>
              <th className="text-left px-4 py-2 text-sm font-medium text-gray-500 uppercase">Equipment</th>
              <th className="text-left px-4 py-2 text-sm font-medium text-gray-500 uppercase">Additional Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentCategory?.activities.map((activity) => (
              <tr key={activity}>
                <td className="px-4 py-4">
                  <Label>{activity}</Label>
                </td>
                <td className="px-4 py-4">
                  <select
                    value={data[activity.toLowerCase()]?.independenceLevel || ''}
                    onChange={(e) => handleChange(activity, 'independenceLevel', e.target.value)}
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value="">Select level</option>
                    <option value="independent">Independent</option>
                    <option value="modified">Modified Independent</option>
                    <option value="supervision">Supervision Required</option>
                    <option value="minimal">Minimal Assistance</option>
                    <option value="moderate">Moderate Assistance</option>
                    <option value="maximal">Maximal Assistance</option>
                    <option value="dependent">Dependent</option>
                  </select>
                </td>
                <td className="px-4 py-4">
                  <Textarea
                    value={data[activity.toLowerCase()]?.assistanceRequired || ''}
                    onChange={(e) => handleChange(activity, 'assistanceRequired', e.target.value)}
                    placeholder="Describe assistance needed..."
                    className="min-h-[80px] text-sm"
                  />
                </td>
                <td className="px-4 py-4">
                  <Textarea
                    value={data[activity.toLowerCase()]?.equipmentUsed || ''}
                    onChange={(e) => handleChange(activity, 'equipmentUsed', e.target.value)}
                    placeholder="List any equipment or adaptations..."
                    className="min-h-[80px] text-sm"
                  />
                </td>
                <td className="px-4 py-4">
                  <Textarea
                    value={data[activity.toLowerCase()]?.notes || ''}
                    onChange={(e) => handleChange(activity, 'notes', e.target.value)}
                    placeholder="Any additional observations..."
                    className="min-h-[80px] text-sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}