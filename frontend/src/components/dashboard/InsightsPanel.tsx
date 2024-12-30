import React from 'react';
import { InsightData } from '../../types/dashboard';
import { AlertCircle, Info, AlertTriangle, CheckCircle } from 'lucide-react';

interface Props {
  insights: InsightData[];
}

const InsightsPanel: React.FC<Props> = ({ insights }) => {
  const getIcon = (type: InsightData['type'], priority: InsightData['priority']) => {
    switch (type) {
      case 'risk':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'action':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'status':
        return priority === 'high' 
          ? <AlertTriangle className="h-5 w-5 text-yellow-500" />
          : <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityClass = (priority: InsightData['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border ${getPriorityClass(insight.priority)}`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon(insight.type, insight.priority)}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-gray-900">{insight.message}</p>
              <p className="mt-1 text-xs text-gray-500">
                {new Date(insight.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InsightsPanel;