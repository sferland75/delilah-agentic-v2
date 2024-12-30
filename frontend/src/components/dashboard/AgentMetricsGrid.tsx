import React from 'react';
import {
    Activity,
    Brain,
    FileText,
    TrendingUp,
    TrendingDown,
    Minus
} from 'lucide-react';

interface MetricCardProps {
    label: string;
    value: number;
    trend?: number;
    icon: React.ReactNode;
}

const TrendIndicator = ({ value }: { value?: number }) => {
    if (!value) return <Minus className="w-4 h-4 text-gray-400" />;
    
    if (value > 0) {
        return (
            <div className="flex items-center text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+{value}%</span>
            </div>
        );
    }
    
    return (
        <div className="flex items-center text-red-600">
            <TrendingDown className="w-4 h-4 mr-1" />
            <span>{value}%</span>
        </div>
    );
};

const MetricCard: React.FC<MetricCardProps> = ({
    label,
    value,
    trend,
    icon
}) => {
    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
                <div className="p-2 rounded-full bg-blue-50">
                    {icon}
                </div>
                <TrendIndicator value={trend} />
            </div>
            <div className="mt-4">
                <h3 className="text-gray-500 text-sm">{label}</h3>
                <p className="text-2xl font-semibold mt-1">{value}</p>
            </div>
        </div>
    );
};

interface AgentMetricsGridProps {
    metrics: Record<string, any>;
}

export const AgentMetricsGrid: React.FC<AgentMetricsGridProps> = ({ metrics }) => {
    const defaultMetrics = [
        {
            label: 'Active Assessments',
            value: metrics.activeAssessments?.value || 0,
            trend: metrics.activeAssessments?.trend,
            icon: <Activity className="w-6 h-6 text-blue-500" />
        },
        {
            label: 'Insights Generated',
            value: metrics.insightsGenerated?.value || 0,
            trend: metrics.insightsGenerated?.trend,
            icon: <Brain className="w-6 h-6 text-purple-500" />
        },
        {
            label: 'Reports Completed',
            value: metrics.reportsCompleted?.value || 0,
            trend: metrics.reportsCompleted?.trend,
            icon: <FileText className="w-6 h-6 text-green-500" />
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {defaultMetrics.map((metric, index) => (
                <MetricCard
                    key={index}
                    label={metric.label}
                    value={metric.value}
                    trend={metric.trend}
                    icon={metric.icon}
                />
            ))}
        </div>
    );
};