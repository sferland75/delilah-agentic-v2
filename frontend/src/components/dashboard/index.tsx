import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAnalysisDashboard from '../../hooks/useAnalysisDashboard';
import { MetricsGrid } from './MetricsGrid';
import TrendsChart from './TrendsChart';
import InsightsPanel from './InsightsPanel';
import { ErrorState } from '../common/ErrorState';
import { LoadingState } from '../common/LoadingState';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    metrics,
    trends,
    insights,
    loading,
    error,
    refreshDashboard
  } = useAnalysisDashboard();

  // Add debug logging
  useEffect(() => {
    console.log('Dashboard State:', {
      loading,
      error,
      hasMetrics: !!metrics,
      hasTrends: !!trends,
      hasInsights: !!insights
    });
  }, [loading, error, metrics, trends, insights]);

  const handleClientClick = () => {
    navigate('/clients');
  };

  const handleAssessmentClick = () => {
    navigate('/assessments');
  };

  if (loading && !metrics) {
    return (
      <div className="p-6">
        <LoadingState message="Loading dashboard data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState 
          error={error} 
          onRetry={refreshDashboard} 
        />
      </div>
    );
  }

  if (!metrics || !trends || !insights) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 h-32 rounded-lg"></div>
            ))}
          </div>
          <div className="bg-gray-100 h-64 rounded-lg"></div>
          <div className="bg-gray-100 h-96 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Quick Actions Bar */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex gap-4">
          <button
            onClick={refreshDashboard}
            disabled={loading}
            className={`px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleAssessmentClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            New Assessment
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <MetricsGrid
        metrics={metrics}
        onClientClick={handleClientClick}
        onAssessmentClick={handleAssessmentClick}
      />

      {/* Trends Chart */}
      {trends && <TrendsChart data={trends} />}

      {/* Insights Panel */}
      {insights && <InsightsPanel insights={insights} />}
    </div>
  );
};

export default Dashboard;