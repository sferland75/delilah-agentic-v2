import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AssessmentData } from '../types/assessment';
import { assessmentService } from '../services/assessmentService';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from './LoadingSpinner';

const AssessmentList: React.FC = () => {
  const [assessments, setAssessments] = useState<AssessmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const data = await assessmentService.getAll();
      setAssessments(data);
    } catch (error) {
      console.error('Error loading assessments:', error);
      showToast('Failed to load assessments', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Assessments</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all OT assessments including client name, type, and status.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/assessments/new"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            New Assessment
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Client Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Location
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {assessments.map((assessment) => (
                    <tr
                      key={assessment.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/assessments/${assessment.id}`)}
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {assessment.core.clientInfo.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {assessment.assessmentType}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(assessment.dateTime).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                            assessment.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : assessment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {assessment.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {assessment.location}
                      </td>
                      <td className="relative whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <Link
                          to={`/assessments/${assessment.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentList;