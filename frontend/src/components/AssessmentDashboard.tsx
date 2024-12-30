import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';

interface AssessmentStatus {
  intake: number;
  processing: number;
  analysis: number;
  documentation: number;
  completed: number;
  error: number;
}

interface Assessment {
  id: string;
  client_id: string;
  therapist_id: string;
  status: string;
  assessment_type: string;
  intake_date: string;
  current_stage?: string;
}

const AssessmentDashboard: React.FC = () => {
  const [queueStatus, setQueueStatus] = useState<AssessmentStatus | null>(null);
  const [recentAssessments, setRecentAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch queue status
        const statusResponse = await fetch('/api/queue/status');
        const statusData = await statusResponse.json();
        setQueueStatus(statusData);

        // Fetch recent assessments
        const assessmentsResponse = await fetch('/api/assessments');
        const assessmentsData = await assessmentsResponse.json();
        setRecentAssessments(assessmentsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'intake': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'analysis': return 'bg-purple-100 text-purple-800';
      case 'documentation': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const chartData = queueStatus ? [
    { name: 'Queue Status', ...queueStatus }
  ] : [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Assessment Dashboard</h1>

      {/* Queue Status Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Queue Status</h2>
        <div className="h-64">
          <BarChart
            width={800}
            height={240}
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="intake" fill="#8884d8" name="Intake" />
            <Bar dataKey="processing" fill="#82ca9d" name="Processing" />
            <Bar dataKey="analysis" fill="#ffc658" name="Analysis" />
            <Bar dataKey="documentation" fill="#ff7300" name="Documentation" />
            <Bar dataKey="completed" fill="#0088fe" name="Completed" />
            <Bar dataKey="error" fill="#ff0000" name="Error" />
          </BarChart>
        </div>
      </div>

      {/* Recent Assessments */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Assessments</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Intake Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentAssessments.map((assessment) => (
                <tr key={assessment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {assessment.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assessment.assessment_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(assessment.status)}`}>
                      {assessment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assessment.current_stage || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(assessment.intake_date), 'MMM d, yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Weekly Progress</h3>
          <div className="text-3xl font-bold text-blue-600">
            {queueStatus?.completed || 0}
          </div>
          <div className="text-sm text-gray-500">
            Assessments completed this week
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Current Load</h3>
          <div className="text-3xl font-bold text-yellow-600">
            {(queueStatus?.processing || 0) + (queueStatus?.analysis || 0) + (queueStatus?.documentation || 0)}
          </div>
          <div className="text-sm text-gray-500">
            Assessments in progress
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Attention Needed</h3>
          <div className="text-3xl font-bold text-red-600">
            {queueStatus?.error || 0}
          </div>
          <div className="text-sm text-gray-500">
            Assessments with errors
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentDashboard;