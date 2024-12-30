import React from 'react';
import { RecommendationGroups } from '../../../types/assessment';

interface Props {
    data: RecommendationGroups;
    onChange: (data: RecommendationGroups) => void;
}

const RecommendationsSection: React.FC<Props> = ({ data, onChange }) => {
    const handleAddItem = (field: keyof RecommendationGroups) => {
        if (field === 'followUp') return; // followUp is a string, not an array

        const newItem = window.prompt(`Add new ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} item:`);
        if (newItem) {
            onChange({
                ...data,
                [field]: [...data[field as keyof Pick<RecommendationGroups, 'equipment' | 'homeModifications' | 'therapy' | 'referrals'>], newItem]
            });
        }
    };

    const handleRemoveItem = (field: keyof RecommendationGroups, index: number) => {
        if (field === 'followUp') return;
        
        const newArray = [...data[field as keyof Pick<RecommendationGroups, 'equipment' | 'homeModifications' | 'therapy' | 'referrals'>]];
        newArray.splice(index, 1);
        
        onChange({
            ...data,
            [field]: newArray
        });
    };

    const renderListSection = (field: keyof Omit<RecommendationGroups, 'followUp'>, title: string) => (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">{title}</label>
                <button
                    type="button"
                    onClick={() => handleAddItem(field)}
                    className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
                >
                    + Add Item
                </button>
            </div>
            <div className="space-y-2">
                {data[field].map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span>{item}</span>
                        <button
                            type="button"
                            onClick={() => handleRemoveItem(field, index)}
                            className="text-red-600 hover:text-red-800"
                        >
                            Remove
                        </button>
                    </div>
                ))}
                {data[field].length === 0 && (
                    <p className="text-gray-500 italic">No items added</p>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {renderListSection('equipment', 'Equipment Recommendations')}
            {renderListSection('homeModifications', 'Home Modifications')}
            {renderListSection('therapy', 'Therapy Recommendations')}
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Plan</label>
                <textarea
                    value={data.followUp}
                    onChange={(e) => onChange({ ...data, followUp: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={4}
                />
            </div>
            
            {renderListSection('referrals', 'Referrals')}
        </div>
    );
};

export default RecommendationsSection;