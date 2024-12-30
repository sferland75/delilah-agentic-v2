import { useState, useEffect, useCallback } from 'react';
import { DashboardState, ErrorState } from '../types/dashboard';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';
const RETRY_DELAY = 5000;
const MAX_RETRIES = 3;

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardState>({
    metrics: {
      activeClients: { value: 0 },
      pendingAssessments: { value: 0 },
      scheduledHours: { value: 0 },
      reportsDue: { value: 0 }
    },
    trends: [],
    insights: [],
    status: 'loading'
  });

  const [error, setError] = useState<ErrorState | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket(`${WS_URL}/dashboard`);

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setData(prevData => ({
          ...prevData,
          ...message,
          status: 'success'
        }));
        setError(null);
        setRetryCount(0);
      } catch (err) {
        setError({
          type: 'data',
          message: 'Failed to parse dashboard data',
          timestamp: new Date().toISOString(),
          retryCount
        });
      }
    };

    ws.onclose = () => {
      setError({
        type: 'connection',
        message: 'WebSocket connection closed',
        timestamp: new Date().toISOString(),
        retryCount
      });

      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          connectWebSocket();
        }, RETRY_DELAY);
      }
    };

    ws.onerror = () => {
      setError({
        type: 'connection',
        message: 'WebSocket connection error',
        timestamp: new Date().toISOString(),
        retryCount
      });
    };

    return ws;
  }, [retryCount]);

  useEffect(() => {
    const ws = connectWebSocket();
    return () => ws.close();
  }, [connectWebSocket]);

  return { data, error };
};

export default useDashboardData;