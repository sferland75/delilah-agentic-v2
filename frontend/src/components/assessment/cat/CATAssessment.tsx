import React from 'react';
import { CATAssessment } from '../../../types/assessment';

interface Props {
    data: CATAssessment;
    onChange: (value: CATAssessment) => void;
    includesSituational?: boolean;
}

const CATAssessmentForm: React.FC<Props> = ({ data, onChange, includesSituational = false }) => {
    const handleFunctionalImpactChange = (category: keyof typeof data.functionalImpacts, value: string[]) => {
        onChange({
            ...data,
            functionalImpacts: {
                ...data.functionalImpacts,
                [category]: value
            }
        });
    };

    const addFunctionalImpact = (category: keyof typeof data.functionalImpacts) => {
        const newImpact = window.prompt(`Enter new ${category} impact:`);
        if (newImpact) {
            handleFunctionalImpactChange(
                category,
                [...data.functionalImpacts[category], newImpact]
            );
        }
    };

    const removeFunctionalImpact = (category: keyof typeof data.functionalImpacts, index: number) => {
        const impacts = [...data.functionalImpacts[category]];
        impacts.splice(index, 1);
        handleFunctionalImpactChange(category, impacts);
    };

    const handleSupportingDocAdd = () => {
        const type = window.prompt('Enter document type:');
        const description = window.prompt('Enter description:');
        const date = window.prompt('Enter date:');

        if (type && description && date) {
            onChange({
                ...data,
                supportingDocuments: [
                    ...(data.supportingDocuments || []),
                    { type, description, date }
                ]
            });
        }
    };

    const removeDoc = (index: number) => {
        const docs = [...(data.supportingDocuments || [])];
        docs.splice(index, 1);
        onChange({ ...data, supportingDocuments: docs });
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Functional Impacts</h3>
                <div className="space-y-6">
                    {(Object.keys(data.functionalImpacts) as Array<keyof typeof data.functionalImpacts>).map(category => (
                        <div key={category}>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-medium text-gray-700 capitalize">
                                    {category} Impacts
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => addFunctionalImpact(category)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                >
                                    + Add Impact
                                </button>
                            </div>
                            <div className="space-y-2">
                                {data.functionalImpacts[category].map((impact, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                        <span>{impact}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFunctionalImpact(category, index)}
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

            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Clinical Observations</h3>
                <textarea
                    value={data.clinicalObservations}
                    onChange={(e) => onChange({...data, clinicalObservations: e.target.value})}
                    rows={4}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter clinical observations..."
                />
            </div>

            {includesSituational && (
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Situational Assessment</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Scenario</label>
                            <textarea
                                value={data.situational?.scenario || ''}
                                onChange={(e) => onChange({
                                    ...data,
                                    situational: {
                                        ...data.situational || { observations: [], recommendations: [] },
                                        scenario: e.target.value
                                    }
                                })}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Supporting Documentation</h3>
                    <button
                        type="button"
                        onClick={handleSupportingDocAdd}
                        className="text-indigo-600 hover:text-indigo-900"
                    >
                        + Add Document
                    </button>
                </div>
                <div className="space-y-4">
                    {(data.supportingDocuments || []).map((doc, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                            <div>
                                <p className="text-sm font-medium">{doc.type}</p>
                                <p className="text-sm text-gray-500">{doc.description}</p>
                                <p className="text-sm text-gray-500">{doc.date}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeDoc(index)}
                                className="text-red-600 hover:text-red-900"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CATAssessmentForm;