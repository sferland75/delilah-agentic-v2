import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../index';
import { useDashboardData } from '../../../hooks/useDashboardData';

// Mock the custom hook
jest.mock('../../../hooks/useDashboardData');

const mockDashboardData = {
  metrics: {
    activeClients: {
      value: 42,
      change: 2,
      period: 'this week'
    },
    pendingAssessments: {
      value: 7,
      priority: 3
    },
    scheduledHours: {
      value: 28,
      nextWeek: 32
    },
    reportsDue: {
      value: 5,
      urgent: 2
    }
  },
  trends: {
    completed: [
      { date: '2024-01-01', value: 10 },
      { date: '2024-01-02', value: 12 }
    ],
    pending: [
      { date: '2024-01-01', value: 5 },
      { date: '2024-01-02', value: 6 }
    ],
    predicted: [
      { date: '2024-01-03', value: 13 },
      { date: '2024-01-04', value: 14 }
    ]
  },
  insights: {
    riskFactors: [{
      type: 'workload_alert',
      message: 'Increased intake rate detected',
      recommendations: ['Consider redistributing new cases']
    }],
    status: 'Moderate workload with some attention needed',
    actionItems: ['Schedule team review for high-priority cases'],
    areasOfAttention: ['Some reports approaching deadline']
  },
  isLoading: false,
  error: null,
  refresh: jest.fn()
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    (useDashboardData as jest.Mock).mockReturnValue(mockDashboardData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    (useDashboardData as jest.Mock).mockReturnValue({
      ...mockDashboardData,
      isLoading: true
    });

    render(<Dashboard />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders error state', () => {
    (useDashboardData as jest.Mock).mockReturnValue({
      ...mockDashboardData,
      error: 'Failed to load dashboard data'
    });

    render(<Dashboard />);
    expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
  });

  it('renders all metric cards', () => {
    render(<Dashboard />);

    // Check metric values
    expect(screen.getByText('42')).toBeInTheDocument(); // Active Clients
    expect(screen.getByText('7')).toBeInTheDocument(); // Pending Assessments
    expect(screen.getByText('28')).toBeInTheDocument(); // Scheduled Hours
    expect(screen.getByText('5')).toBeInTheDocument(); // Reports Due

    // Check highlights and subtexts
    expect(screen.getByText('+2 this week')).toBeInTheDocument();
    expect(screen.getByText('3 high priority')).toBeInTheDocument();
    expect(screen.getByText('Next week: 32')).toBeInTheDocument();
    expect(screen.getByText('2 urgent')).toBeInTheDocument();
  });

  it('renders trends chart', () => {
    render(<Dashboard />);
    expect(screen.getByText('Assessment Trends & Predictions')).toBeInTheDocument();
    // Check for legend items
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Predicted')).toBeInTheDocument();
  });

  it('renders insights section', () => {
    render(<Dashboard />);
    
    // Check risk factors
    expect(screen.getByText('Increased intake rate detected')).toBeInTheDocument();
    expect(screen.getByText('Consider redistributing new cases')).toBeInTheDocument();
    
    // Check status
    expect(screen.getByText('Moderate workload with some attention needed')).toBeInTheDocument();
    
    // Check action items
    expect(screen.getByText('Schedule team review for high-priority cases')).toBeInTheDocument();
    
    // Check areas of attention
    expect(screen.getByText('Some reports approaching deadline')).toBeInTheDocument();
  });

  it('calls refresh when button is clicked', async () => {
    render(<Dashboard />);
    const refreshButton = screen.getByText('Refresh');
    
    await userEvent.click(refreshButton);
    expect(mockDashboardData.refresh).toHaveBeenCalled();
  });
});