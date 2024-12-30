import React from 'react';
import { HomeEnvironment } from '../../../types/assessment';

interface Props {
    data: HomeEnvironment;
    onChange: (data: HomeEnvironment) => void;
}

const EnvironmentalSection: React.FC<Props> = ({ data, onChange }) => {
    const handleChange = (field: keyof HomeEnvironment, value: string | string[]) => {
        onChange({
            ...data,
            [field]: value
        });
    };

    const addListItem = (field: 'safetyRisks' | 'equipment') => {
        const newItem = window.prompt(`Add new ${field.replace(/([A-Z])/g, ' $1').toLowerCase().trim()} item:`);
        if (newItem) {
            handleChange(field, [...data[field], newItem]);
        }
    };

    const removeListItem = (field: 'safetyRisks' | 'equipment', index: number) => {
        handleChange(field, data[field].filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Home Setup</label>
                <textarea
                    value={data.homeSetup}
                    onChange={(e) => handleChange('homeSetup', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Access</label>
                <textarea
                    value={data.access}
                    onChange={(e) => handleChange('access', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Layout</label>
                <textarea
                    value={data.layout}
                    onChange={(e) => handleChange('layout', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Barriers</label>
                <textarea
                    value={data.barriers}
                    onChange={(e) => handleChange('barriers', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                />
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Safety Risks</label>
                    <button
                        type="button"
                        onClick={() => addListItem('safetyRisks')}
                        className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
                    >
                        + Add Risk
                    </button>
                </div>
                <div className="space-y-2">
                    {data.safetyRisks.map((risk, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span>{risk}</span>
                            <button
                                type="button"
                                onClick={() => removeListItem('safetyRisks', index)}
                                className="text-red-600 hover:text-red-800"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Equipment</label>
                    <button
                        type="button"
                        onClick={() => addListItem('equipment')}
                        className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
                    >
                        + Add Equipment
                    </button>
                </div>
                <div className="space-y-2">
                    {data.equipment.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span>{item}</span>
                            <button
                                type="button"
                                onClick={() => removeListItem('equipment', index)}
                                className="text-red-600 hover:text-red-800"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Support Systems</label>
                <textarea
                    value={data.supportSystems}
                    onChange={(e) => handleChange('supportSystems', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                />
            </div>
        </div>
    );
};

export default EnvironmentalSection;