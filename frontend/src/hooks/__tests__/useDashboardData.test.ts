import { renderHook, act } from '@testing-library/react';
import { useDashboardData } from '../useDashboardData';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock WebSocket
class MockWebSocket {
  onopen: (() => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((error: any) => void) | null = null;
  send = jest.fn();
  close = jest.fn();

  constructor(url: string) {}
}

global.WebSocket = MockWebSocket as any;

describe('useDashboardData', () => {
  const mockInitialData = {
    metrics: {
      activeClients: { value: 42, change: 2, period: 'this week' },
      pendingAssessments: { value: 7, priority: 3 },
      scheduledHours: { value: 28, nextWeek: 32 },
      reportsDue: { value: 5, urgent: 2 }
    },
    trends: {
      completed: [{ date: '2024-01-01', value: 10 }],
      pending: [{ date: '2024-01-01', value: 5 }],
      predicted: [{ date: '2024-01-02', value: 12 }]
    },
    insights: {
      riskFactors: [],
      status: 'Normal workload',
      actionItems: [],
      areasOfAttention: []
    }
  };

  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockInitialData)
      })
    );
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('fetches initial data on mount', async () => {
    const { result } = renderHook(() => useDashboardData());

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.metrics).toEqual(mockInitialData.metrics);
    expect(result.current.trends).toEqual(mockInitialData.trends);
    expect(result.current.insights).toEqual(mockInitialData.insights);
  });

  it('handles fetch errors', async () => {
    mockFetch.mockImplementation(() => 
      Promise.reject(new Error('Network error'))
    );

    const { result } = renderHook(() => useDashboardData());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe('Failed to load initial data');
  });

  it('handles WebSocket updates for all metric types', async () => {
    const { result } = renderHook(() => useDashboardData());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const ws = new MockWebSocket('');
    
    // Test updates for all metric types
    const updates = [
      {
        type: 'metric_update',
        data: {
          metric: 'client_activity',
          value: 45,
          metadata: { change: 3 }
        }
      },
      {
        type: 'metric_update',
        data: {
          metric: 'assessment_status',
          value: 'pending',
          metadata: { count: 8, high_priority: 4 }
        }
      },
      {
        type: 'metric_update',
        data: {
          metric: 'scheduled_hours',
          value: 30,
          metadata: { next_week: 35 }
        }
      },
      {
        type: 'metric_update',
        data: {
          metric: 'report_status',
          value: 'pending',
          metadata: { count: 6, urgent: 3 }
        }
      }
    ];

    // Apply each update
    for (const update of updates) {
      act(() => {
        if (ws.onmessage) {
          ws.onmessage({ data: JSON.stringify(update) });
        }
      });
    }

    // Verify final state
    expect(result.current.metrics.activeClients.value).toBe(45);
    expect(result.current.metrics.activeClients.change).toBe(3);
    
    expect(result.current.metrics.pendingAssessments.value).toBe(8);
    expect(result.current.metrics.pendingAssessments.priority).toBe(4);
    
    expect(result.current.metrics.scheduledHours.value).toBe(30);
    expect(result.current.metrics.scheduledHours.nextWeek).toBe(35);
    
    expect(result.current.metrics.reportsDue.value).toBe(6);
    expect(result.current.metrics.reportsDue.urgent).toBe(3);
  });

  it('handles trend updates', async () => {
    const { result } = renderHook(() => useDashboardData());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const ws = new MockWebSocket('');
    
    // Simulate trend update
    act(() => {
      if (ws.onmessage) {
        ws.onmessage({
          data: JSON.stringify({
            type: 'trend_update',
            data: {
              completed: [{ date: '2024-01-03', value: 15 }],
              pending: [{ date: '2024-01-03', value: 8 }],
              predicted: [{ date: '2024-01-04', value: 16 }]
            }
          })
        });
      }
    });

    expect(result.current.trends.completed[0].value).toBe(15);
    expect(result.current.trends.pending[0].value).toBe(8);
    expect(result.current.trends.predicted[0].value).toBe(16);
  });

  it('handles insights updates', async () => {
    const { result } = renderHook(() => useDashboardData());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const ws = new MockWebSocket('');
    
    // Simulate insights update
    const newInsights = {
      riskFactors: [{
        type: 'workload_alert',
        message: 'High workload detected',
        recommendations: ['Review capacity']
      }],
      status: 'High workload',
      actionItems: ['Redistribute tasks'],
      areasOfAttention: ['Workload management']
    };

    act(() => {
      if (ws.onmessage) {
        ws.onmessage({
          data: JSON.stringify({
            type: 'insights_update',
            data: newInsights
          })
        });
      }
    });

    expect(result.current.insights).toEqual(newInsights);
  });

  it('maintains WebSocket connection with ping/pong', async () => {
    const { result } = renderHook(() => useDashboardData());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const ws = new MockWebSocket('');
    
    // Verify initial ping
    act(() => {
      if (ws.onopen) ws.onopen();
      jest.advanceTimersByTime(30000);
    });

    expect(ws.send).toHaveBeenCalledWith(JSON.stringify({ type: 'ping' }));

    // Verify continuous pings
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    expect(ws.send).toHaveBeenCalledTimes(2);
  });

  it('handles refresh functionality', async () => {
    const { result } = renderHook(() => useDashboardData());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Clear previous fetch calls
    mockFetch.mockClear();

    // Trigger refresh
    await act(async () => {
      result.current.refresh();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Verify new fetch call was made
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('/api/dashboard/metrics');
  });

  it('cleans up resources on unmount', () => {
    const { unmount } = renderHook(() => useDashboardData());
    
    const ws = new MockWebSocket('');
    
    // Simulate open connection
    act(() => {
      if (ws.onopen) ws.onopen();
    });

    // Unmount component
    unmount();

    // Verify cleanup
    expect(ws.close).toHaveBeenCalled();
    expect(clearInterval).toHaveBeenCalled();
  });
});