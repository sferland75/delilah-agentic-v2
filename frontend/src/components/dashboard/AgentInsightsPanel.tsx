import React from 'react';
import { InsightData, Priority } from '../../types/agent';
import { 
    AlertCircle, 
    AlertTriangle, 
    Info,
    Clock
} from 'lucide-react';

interface InsightCardProps {
    insight: InsightData;
}

const PriorityIcon = ({ priority }: { priority: Priority }) => {
    switch (priority) {
        case 'high':
            return <AlertCircle className="text-red-500" />;
        case 'medium':
            return <AlertTriangle className="text-yellow-500" />;
        case 'low':
            return <Info className="text-blue-500" />;
    }
};

const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
    const { message, priority, timestamp, source } = insight;
    const formattedTime = new Date(timestamp).toLocaleTimeString();

    return (
        <div className={`
            p-4 rounded-lg border
            ${priority === 'high' ? 'border-red-200 bg-red-50' :
              priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
              'border-blue-200 bg-blue-50'}
        `}>
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                    <PriorityIcon priority={priority} />
                </div>
                <div className="flex-1">
                    <p className="text-sm text-gray-900">{message}</p>
                    <div className="mt-1 flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{formattedTime}</span>
                        {source && (
                            <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded">
                                {source.type}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface AgentInsightsPanelProps {
    insights: InsightData[];
    onClear?: () => void;
}

export const AgentInsightsPanel: React.FC<AgentInsightsPanelProps> = ({
    insights,
    onClear
}) => {
    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Real-time Insights</h2>
                {onClear && (
                    <button
                        onClick={onClear}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Clear All
                    </button>
                )}
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {insights.map((insight) => (
                    <InsightCard key={insight.id} insight={insight} />
                ))}
                {insights.length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                        No insights available
                    </p>
                )}
            </div>
        </div>
    );
};