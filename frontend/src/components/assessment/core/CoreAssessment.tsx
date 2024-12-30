import React from 'react';
import { CoreAssessment as CoreAssessmentType } from '../../../types/assessment';

interface Props {
    data: CoreAssessmentType;
    onChange: (data: CoreAssessmentType) => void;
}

const CoreAssessment: React.FC<Props> = ({ data, onChange }) => {
    const updateClientInfo = (field: keyof CoreAssessmentType['clientInfo'], value: string) => {
        onChange({
            ...data,
            clientInfo: {
                ...data.clientInfo,
                [field]: value
            }
        });
    };

    const updateFunctionalStatus = (field: keyof CoreAssessmentType['functionalStatus'], value: string) => {
        onChange({
            ...data,
            functionalStatus: {
                ...data.functionalStatus,
                [field]: value
            }
        });
    };

    const updateHomeEnvironment = (field: keyof CoreAssessmentType['homeEnvironment'], value: string | string[]) => {
        onChange({
            ...data,
            homeEnvironment: {
                ...data.homeEnvironment,
                [field]: value
            }
        });
    };

    const updateRecommendations = (field: keyof CoreAssessmentType['recommendations'], value: string[]) => {
        onChange({
            ...data,
            recommendations: {
                ...data.recommendations,
                [field]: value
            }
        });
    };

    return (
        <div className="space-y-8">
            <div className="bg-white shadow rounded-lg p-6">
                {/* Client Information */}
                <section className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Client Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={data.clientInfo.name}
                                onChange={(e) => updateClientInfo('name', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                            <input
                                type="date"
                                value={data.clientInfo.dateOfBirth}
                                onChange={(e) => updateClientInfo('dateOfBirth', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Claim Number</label>
                            <input
                                type="text"
                                value={data.clientInfo.claimNumber}
                                onChange={(e) => updateClientInfo('claimNumber', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Accident</label>
                            <input
                                type="date"
                                value={data.clientInfo.dateOfAccident}
                                onChange={(e) => updateClientInfo('dateOfAccident', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Referral Date</label>
                            <input
                                type="date"
                                value={data.clientInfo.referralDate}
                                onChange={(e) => updateClientInfo('referralDate', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </section>

                {/* Functional Status */}
                <section className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Functional Status</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobility</label>
                            <textarea
                                value={data.functionalStatus.mobility}
                                onChange={(e) => updateFunctionalStatus('mobility', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Describe mobility status, aids used, and limitations..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Self Care</label>
                            <textarea
                                value={data.functionalStatus.selfCare}
                                onChange={(e) => updateFunctionalStatus('selfCare', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Describe ability to perform self-care activities..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Communication</label>
                            <textarea
                                value={data.functionalStatus.communication}
                                onChange={(e) => updateFunctionalStatus('communication', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Describe communication abilities and any barriers..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cognition</label>
                            <textarea
                                value={data.functionalStatus.cognition}
                                onChange={(e) => updateFunctionalStatus('cognition', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Describe cognitive function, memory, and processing..."
                            />
                        </div>
                    </div>
                </section>

                {/* Home Environment */}
                <section className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Home Environment</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Access</label>
                            <textarea
                                value={data.homeEnvironment.access}
                                onChange={(e) => updateHomeEnvironment('access', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Describe home access, entrance ways, stairs..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Layout</label>
                            <textarea
                                value={data.homeEnvironment.layout}
                                onChange={(e) => updateHomeEnvironment('layout', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Describe home layout, room arrangement..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Barriers</label>
                            <textarea
                                value={data.homeEnvironment.barriers}
                                onChange={(e) => updateHomeEnvironment('barriers', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="List physical barriers and challenges..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Safety Risks</label>
                            <div className="space-y-2">
                                {data.homeEnvironment.safetyRisks.map((risk, index) => (
                                    <div key={index} className="flex items-center">
                                        <span className="flex-grow">{risk}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newRisks = [...data.homeEnvironment.safetyRisks];
                                                newRisks.splice(index, 1);
                                                updateHomeEnvironment('safetyRisks', newRisks);
                                            }}
                                            className="ml-2 text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newRisk = window.prompt('Enter new safety risk:');
                                        if (newRisk) {
                                            updateHomeEnvironment('safetyRisks', [...data.homeEnvironment.safetyRisks, newRisk]);
                                        }
                                    }}
                                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Add Safety Risk
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Recommendations */}
                <section>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
                    <div className="space-y-6">
                        {(['immediate', 'shortTerm', 'longTerm'] as const).map((type) => (
                            <div key={type}>
                                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                    {type.replace(/([A-Z])/g, ' $1').trim()} Recommendations
                                </label>
                                <div className="space-y-2">
                                    {data.recommendations[type].map((rec, index) => (
                                        <div key={index} className="flex items-center">
                                            <span className="flex-grow">{rec}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newRecs = [...data.recommendations[type]];
                                                    newRecs.splice(index, 1);
                                                    updateRecommendations(type, newRecs);
                                                }}
                                                className="ml-2 text-red-600 hover:text-red-800"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newRec = window.prompt(`Enter new ${type} recommendation:`);
                                            if (newRec) {
                                                updateRecommendations(type, [...data.recommendations[type], newRec]);
                                            }
                                        }}
                                        className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Add Recommendation
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default CoreAssessment;