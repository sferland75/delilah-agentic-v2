# Frontend Components Documentation

## Dashboard Components

### MetricsGrid Component
```typescript
import { MetricsGrid } from './dashboard/MetricsGrid';

// Props interface
interface MetricsGridProps {
  metrics: DashboardMetrics;
  onClientClick: () => void;
  onAssessmentClick: () => void;
}

// Usage example
<MetricsGrid 
  metrics={dashboardMetrics} 
  onClientClick={handleClientClick}
  onAssessmentClick={handleAssessmentClick}
/>
```

Features:
- Displays key metrics in a responsive grid
- Clickable sections for navigation
- Color-coded trends
- Real-time updates support

### TrendsChart Component
```typescript
import { TrendsChart } from './dashboard/TrendsChart';

// Props interface
interface TrendsChartProps {
  trends: DashboardTrends;
}

// Usage example
<TrendsChart trends={dashboardTrends} />
```

Features:
- Interactive line chart
- Multiple data series
- Tooltips with detailed information
- Predictive trend line
- Customizable timeframe

### InsightsPanel Component
```typescript
import { InsightsPanel } from './dashboard/InsightsPanel';

// Props interface
interface InsightsPanelProps {
  insights: DashboardInsights;
}

// Usage example
<InsightsPanel insights={dashboardInsights} />
```

Features:
- Priority-based insights display
- Interactive recommendations
- Real-time updates
- Collapsible sections

## Common Components

### LoadingState Component
```typescript
import { LoadingState } from './common/LoadingState';

// Props interface
interface LoadingStateProps {
  message?: string;
  fullscreen?: boolean;
}

// Usage example
<LoadingState 
  message="Loading dashboard data..." 
  fullscreen={true}
/>
```

Features:
- Customizable loading message
- Optional fullscreen overlay
- Animated spinner
- Accessible design

### ErrorState Component
```typescript
import { ErrorState } from './common/ErrorState';

// Props interface
interface ErrorStateProps {
  error: Error;
  onRetry?: () => void;
  fullscreen?: boolean;
}

// Usage example
<ErrorState 
  error={error}
  onRetry={handleRetry}
/>
```

Features:
- Error message display
- Optional retry functionality
- Accessible error states
- Customizable appearance

## Hooks

### useAgent Hook
```typescript
import { useAgent } from '../hooks/useAgent';

// Usage example
function MyComponent() {
  const {
    data,
    loading,
    error,
    queryAgent,
    subscribe
  } = useAgent('agent-name');

  useEffect(() => {
    const unsubscribe = subscribe('EVENT_TYPE', handleEvent);
    return () => unsubscribe();
  }, []);
}
```

Features:
- Agent communication
- Automatic loading states
- Error handling
- Subscription management
- Type safety

### useAnalysisDashboard Hook
```typescript
import { useAnalysisDashboard } from '../hooks/useAnalysisDashboard';

// Usage example
function Dashboard() {
  const {
    metrics,
    trends,
    insights,
    loading,
    error,
    refreshDashboard
  } = useAnalysisDashboard();
}
```

Features:
- Complete dashboard state management
- Real-time updates
- Error handling
- Refresh functionality
- Type-safe data

## Services

### AgentService
```typescript
import { agentService } from '../services/AgentService';

// Usage example
async function sendMessage() {
  try {
    const response = await agentService.queryAgent(
      'agent-name',
      'ACTION',
      data
    );
  } catch (error) {
    handleError(error);
  }
}
```

Features:
- WebSocket communication
- Message queueing
- Error handling
- Reconnection logic
- Type safety

## Style Guide

### CSS Classes
```typescript
// Common class patterns
const commonClasses = {
  container: "p-6 max-w-7xl mx-auto",
  card: "bg-white rounded-lg shadow p-6",
  button: "px-4 py-2 rounded-md",
  heading: "text-lg font-semibold text-gray-900",
};

// Usage example
<div className={commonClasses.container}>
  <div className={commonClasses.card}>
    <h2 className={commonClasses.heading}>Title</h2>
  </div>
</div>
```

### Component Structure
```typescript
// Standard component structure
import React from 'react';
import type { ComponentProps } from './types';

export const Component: React.FC<ComponentProps> = ({
  prop1,
  prop2
}) => {
  // State management
  const [state, setState] = useState();

  // Effects
  useEffect(() => {
    // Setup code
    return () => {
      // Cleanup code
    };
  }, []);

  // Event handlers
  const handleEvent = () => {
    // Handler logic
  };

  // Render helpers
  const renderSection = () => {
    return (
      // Section JSX
    );
  };

  // Main render
  return (
    <div>
      {renderSection()}
    </div>
  );
};
```

## Best Practices

### Component Organization
```typescript
// Component file structure
ComponentName/
├── index.tsx        // Main component
├── types.ts         // Type definitions
├── styles.ts        // Styled components/styles
└── utils.ts         // Helper functions
```

### Performance Optimization
```typescript
// Memoization example
const MemoizedComponent = React.memo(Component);

// useCallback example
const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);

// useMemo example
const computedValue = useMemo(() => {
  return expensiveComputation(value);
}, [value]);
```

### Error Handling
```typescript
// Error boundary usage
<ErrorBoundary>
  <ComponentThatMightError />
</ErrorBoundary>

// Try-catch in async operations
async function fetchData() {
  try {
    const data = await api.getData();
    return data;
  } catch (error) {
    handleError(error);
    return null;
  }
}
```

### Accessibility
```typescript
// Accessibility patterns
<button
  aria-label="Refresh dashboard"
  onClick={handleRefresh}
  disabled={loading}
>
  {loading ? 'Refreshing...' : 'Refresh'}
</button>

// Focus management
useEffect(() => {
  if (error) {
    errorRef.current?.focus();
  }
}, [error]);
```

### Testing Patterns
```typescript
// Component test example
describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    const handleClick = jest.fn();
    render(<Component onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```