import React from 'react';
import { FunctionalStatus } from '../../../types/assessment';

interface Props {
    data: FunctionalStatus;
    onChange: (data: FunctionalStatus) => void;
}

const FunctionalSection: React.FC<Props> = ({ data, onChange }) => {
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Self Care</label>
                <textarea
                    value={data.selfCare}
                    onChange={(e) => handleChange('selfCare', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Transfers</label>
                <textarea
                    value={data.transfers}
                    onChange={(e) => handleChange('transfers', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Home Management</label>
                <textarea
                    value={data.homeManagement}
                    onChange={(e) => handleChange('homeManagement', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Community Access</label>
                <textarea
                    value={data.communityAccess}
                    onChange={(e) => handleChange('communityAccess', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Communication</label>
                <textarea
                    value={data.communication}
                    onChange={(e) => handleChange('communication', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Cognition</label>
                <textarea
                    value={data.cognition}
                    onChange={(e) => handleChange('cognition', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                    value={data.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={4}
                />
            </div>
        </div>
    );
};

export default FunctionalSection;