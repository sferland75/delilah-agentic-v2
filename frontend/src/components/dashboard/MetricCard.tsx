import React from 'react';
import { MetricData } from '../../types/dashboard';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface Props {
  title: string;
  metric: MetricData;
}

const MetricCard: React.FC<Props> = ({ title, metric }) => {
  const { value, change, period, priority } = metric;

  const getPriorityColor = (priority?: number) => {
    if (!priority) return 'bg-gray-100';
    if (priority > 5) return 'bg-red-100';
    if (priority > 2) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  return (
    <div className={`p-6 rounded-lg shadow-sm ${getPriorityColor(priority)}`}>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {change !== undefined && (
          <p className={`ml-2 flex items-baseline text-sm font-semibold ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change >= 0 ? (
              <ArrowUpIcon className="h-4 w-4 flex-shrink-0 self-center" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 flex-shrink-0 self-center" />
            )}
            <span className="sr-only">
              {change >= 0 ? 'Increased' : 'Decreased'} by
            </span>
            {Math.abs(change)}%
          </p>
        )}
      </div>
      {period && (
        <div className="mt-1">
          <p className="text-sm text-gray-500">{period}</p>
        </div>
      )}
    </div>
  );
};

export default MetricCard;