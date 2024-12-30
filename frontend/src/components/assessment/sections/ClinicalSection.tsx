import React from 'react';
import { ClinicalInfo } from '../../../types/assessment';

interface Props {
    data: ClinicalInfo;
    onChange: (data: ClinicalInfo) => void;
}

const ClinicalSection: React.FC<Props> = ({ data, onChange }) => {
    const handleChange = (field: keyof ClinicalInfo, value: string | number) => {
        onChange({
            ...data,
            [field]: value
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Symptoms</label>
                <textarea
                    value={data.symptoms}
                    onChange={(e) => handleChange('symptoms', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Pain Level (0-10)</label>
                <input
                    type="number"
                    min="0"
                    max="10"
                    value={data.painLevel}
                    onChange={(e) => handleChange('painLevel', parseInt(e.target.value) || 0)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Range of Motion</label>
                <textarea
                    value={data.rangeOfMotion}
                    onChange={(e) => handleChange('rangeOfMotion', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Strength</label>
                <textarea
                    value={data.strength}
                    onChange={(e) => handleChange('strength', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Endurance</label>
                <textarea
                    value={data.endurance}
                    onChange={(e) => handleChange('endurance', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Balance</label>
                <textarea
                    value={data.balance}
                    onChange={(e) => handleChange('balance', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Coordination</label>
                <textarea
                    value={data.coordination}
                    onChange={(e) => handleChange('coordination', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Clinical Observations</label>
                <textarea
                    value={data.observations}
                    onChange={(e) => handleChange('observations', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={4}
                />
            </div>
        </div>
    );
};

export default ClinicalSection;