import React from 'react';
import { useParams } from 'react-router-dom';

const AssessmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Assessment Details</h1>
      
      {/* Assessment Info */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Assessment #{id}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Client Name</p>
            <p className="font-medium">John Doe</p>
          </div>
          <div>
            <p className="text-gray-600">Date</p>
            <p className="font-medium">2024-12-29</p>
          </div>
          <div>
            <p className="text-gray-600">Type</p>
            <p className="font-medium">Initial Assessment</p>
          </div>
          <div>
            <p className="text-gray-600">Status</p>
            <p className="font-medium">In Progress</p>
          </div>
        </div>
      </div>

      {/* Assessment Content */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Notes</h3>
        <p className="text-gray-700 mb-4">
          Initial assessment findings indicate client would benefit from occupational therapy interventions
          focusing on activities of daily living and fine motor skills development.
        </p>

        <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
        <ul className="list-disc list-inside text-gray-700">
          <li>Weekly therapy sessions</li>
          <li>Home exercise program</li>
          <li>Adaptive equipment assessment</li>
          <li>Follow-up assessment in 6 weeks</li>
        </ul>
      </div>
    </div>
  );
};

export default AssessmentDetail;