import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessments } from '../../hooks/useAssessments';
import { AssessmentType, AssessmentStatus } from '../../types/assessment';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const AssessmentList: React.FC = () => {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState<AssessmentStatus | 'all'>('all');
    const [typeFilter, setTypeFilter] = useState<AssessmentType | 'all'>('all');
    
    const { assessments, isLoading } = useAssessments();

    const filteredAssessments = assessments.data?.filter(assessment => {
        if (statusFilter !== 'all' && assessment.status !== statusFilter) return false;
        if (typeFilter !== 'all' && assessment.type !== typeFilter) return false;
        return true;
    });

    const handleNewAssessment = () => {
        navigate('/assessments/new');
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner className="w-8 h-8 text-blue-600" />
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadgeColor = (status: AssessmentStatus) => {
        switch (status) {
            case 'draft':
                return 'bg-gray-100 text-gray-800';
            case 'inProgress':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'archived':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-xl font-semibold text-gray-900">Assessments</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        A list of all assessments including their client, type, status, and dates.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                        type="button"
                        onClick={handleNewAssessment}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                    >
                        New Assessment
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as AssessmentStatus | 'all')}
                    className="mt-1 block w-full sm:w-auto rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                >
                    <option value="all">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="inProgress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                </select>

                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as AssessmentType | 'all')}
                    className="mt-1 block w-full sm:w-auto rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                >
                    <option value="all">All Types</option>
                    <option value="initial">Initial</option>
                    <option value="followUp">Follow-up</option>
                    <option value="discharge">Discharge</option>
                </select>
            </div>

            {/* Table */}
            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Client
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Type
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Status
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Created
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Last Updated
                                        </th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredAssessments?.map((assessment) => (
                                        <tr key={assessment.id}>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                                {assessment.clientName}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1)}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeColor(assessment.status)}`}>
                                                    {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {formatDate(assessment.dateCreated)}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {formatDate(assessment.lastModified)}
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button
                                                    onClick={() => navigate(`/assessments/${assessment.id}`)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/assessments/${assessment.id}/edit`)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredAssessments?.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No assessments found matching the selected filters.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssessmentList;