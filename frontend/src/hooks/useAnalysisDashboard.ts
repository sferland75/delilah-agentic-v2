import { useState, useEffect, useCallback } from 'react';
import { TrendData, InsightData } from '../types/dashboard';

interface Metrics {
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
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const useAnalysisDashboard = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [trends, setTrends] = useState<TrendData[] | null>(null);
  const [insights, setInsights] = useState<InsightData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, using mock data until API is ready
      setMetrics({
        activeClients: 24,
        pendingAssessments: 8,
        scheduledHours: 32,
        reportsDue: 5,
        trends: {
          clients: 12,
          assessments: -5,
          hours: 8,
          reports: 0
        }
      });

      setTrends([
        { date: '2024-01', completed: 15, pending: 5, predicted: 18 },
        { date: '2024-02', completed: 18, pending: 4, predicted: 20 },
        { date: '2024-03', completed: 22, pending: 6, predicted: 25 }
      ]);

      setInsights([
        {
          id: '1',
          type: 'risk',
          message: 'High workload detected: 8 assessments due this week',
          priority: 'high',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          type: 'action',
          message: '3 reports require immediate attention',
          priority: 'medium',
          timestamp: new Date().toISOString()
        },
        {
          id: '3',
          type: 'status',
          message: 'Client engagement up 12% this month',
          priority: 'low',
          timestamp: new Date().toISOString()
        }
      ]);

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // Poll every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return {
    metrics,
    trends,
    insights,
    loading,
    error,
    refreshDashboard: fetchDashboardData
  };
};

export default useAnalysisDashboard;