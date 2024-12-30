export interface MetricData {
  value: number;
  change?: number;
  period?: string;
  priority?: number;
}

export interface TrendData {
  date: string;
  completed: number;
  pending: number;
  predicted?: number;
}

export interface InsightData {
  id: string;
  type: 'risk' | 'status' | 'action' | 'attention';
  message: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
}

export interface DashboardState {
  metrics: {
    activeClients: MetricData;
    pendingAssessments: MetricData;
    scheduledHours: MetricData;
    reportsDue: MetricData;
  };
  trends: TrendData[];
  insights: InsightData[];
  status: 'loading' | 'error' | 'success';
}

export interface ErrorState {
  type: 'connection' | 'data' | 'auth' | 'unknown';
  message: string;
  timestamp: string;
  retryCount: number;
}