import React from 'react';
import { Users, ClipboardList, Clock, FileText } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 ${
        onClick ? 'cursor-pointer hover:border-blue-500 transition-colors' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {trend && (
              <p className={`ml-2 flex items-baseline text-sm font-semibold ${
                trend >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend >= 0 ? '+' : ''}{trend}%
              </p>
            )}
          </div>
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
    </div>
  );
};

interface MetricsGridProps {
  metrics: {
    activeClients: number;
    pendingAssessments: number;
    scheduledHours: number;
    reportsDue: number;
    trends?: {
      clients?: number;
      assessments?: number;
      hours?: number;
      reports?: number;
    };
  };
  onClientClick?: () => void;
  onAssessmentClick?: () => void;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  metrics,
  onClientClick,
  onAssessmentClick
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Active Clients"
        value={metrics.activeClients}
        icon={<Users className="h-6 w-6" />}
        trend={metrics.trends?.clients}
        onClick={onClientClick}
      />
      <MetricCard
        title="Pending Assessments"
        value={metrics.pendingAssessments}
        icon={<ClipboardList className="h-6 w-6" />}
        trend={metrics.trends?.assessments}
        onClick={onAssessmentClick}
      />
      <MetricCard
        title="Scheduled Hours"
        value={metrics.scheduledHours}
        icon={<Clock className="h-6 w-6" />}
        trend={metrics.trends?.hours}
      />
      <MetricCard
        title="Reports Due"
        value={metrics.reportsDue}
        icon={<FileText className="h-6 w-6" />}
        trend={metrics.trends?.reports}
      />
    </div>
  );
};