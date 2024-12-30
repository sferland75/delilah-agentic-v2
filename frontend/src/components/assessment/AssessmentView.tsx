import React from 'react';
import { AssessmentData } from '../../types/assessment';

interface Props {
    assessment: AssessmentData;
}

export const AssessmentView: React.FC<Props> = ({ assessment }) => {
    return (
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Client Information</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div>Name: {assessment.core.clientInfo.name}</div>
                    <div>Date of Birth: {assessment.core.clientInfo.dateOfBirth}</div>
                    <div>Address: {assessment.core.clientInfo.address}</div>
                    <div>Email: {assessment.core.clientInfo.email}</div>
                    <div>Phone: {assessment.core.clientInfo.phone}</div>
                </dd>
            </div>

            <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Functional Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div>Mobility: {assessment.core.functionalStatus.mobility}</div>
                    <div>Self Care: {assessment.core.functionalStatus.selfCare}</div>
                    <div>Communication: {assessment.core.functionalStatus.communication}</div>
                    <div>Cognition: {assessment.core.functionalStatus.cognition}</div>
                </dd>
            </div>

            {assessment.form1 && (
                <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Form 1 Assessment</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <div>Monthly Cost: ${assessment.form1.monthlyCost.toFixed(2)}</div>
                        <div>Level of Care: {assessment.form1.levelOfCare}</div>
                        <div>Total Hours: {
                            Object.values(assessment.form1.attendantCare)
                                .reduce((sum, care) => sum + care.totalHours, 0)
                        }</div>
                    </dd>
                </div>
            )}

            {assessment.cat && (
                <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">CAT Assessment</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <div>Clinical Observations: {assessment.cat.clinicalObservations}</div>
                        <div className="mt-2">
                            <h4 className="font-medium">Functional Impacts:</h4>
                            <ul className="list-disc pl-5 mt-1">
                                {assessment.cat.functionalImpacts.adl.map((impact, idx) => (
                                    <li key={idx}>{impact}</li>
                                ))}
                            </ul>
                        </div>
                    </dd>
                </div>
            )}

            <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Environmental Assessment</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div>Type: {assessment.core.homeEnvironment.housingType}</div>
                    <div>Access: {assessment.core.homeEnvironment.accessibility}</div>
                    <div>Safety: {assessment.core.homeEnvironment.safety}</div>
                    <div>Modifications: {assessment.core.homeEnvironment.modifications.join(', ')}</div>
                </dd>
            </div>
        </dl>
    );
};

export default AssessmentView;