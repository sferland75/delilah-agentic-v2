# Frontend Architecture

## Overview
Delilah Agentic's frontend is built with React 18, TypeScript, and modern web technologies. It focuses on real-time data visualization and AI-assisted clinical management.

## Core Technologies

### Framework
- React 18
- TypeScript 4.9+
- React Router 6
- Tailwind CSS

### Data Visualization
- Recharts for charts
- Custom SVG components
- Real-time updates

### State Management
- React Context
- Custom hooks
- WebSocket integration

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── assessment/    # Assessment components
│   │   ├── client/        # Client management
│   │   ├── common/        # Shared components
│   │   └── dashboard/     # Dashboard views
│   ├── hooks/
│   │   ├── useAgent.ts    # Agent communication
│   │   ├── useAuth.ts     # Authentication
│   │   └── useData.ts     # Data management
│   ├── services/
│   │   ├── AgentService.ts    # Agent communication
│   │   ├── AuthService.ts     # Authentication
│   │   └── APIService.ts      # API calls
│   ├── types/
│   │   ├── agents.ts      # Agent types
│   │   ├── api.ts         # API types
│   │   └── models.ts      # Data models
│   └── utils/
│       ├── formatting.ts   # Data formatting
│       └── validation.ts   # Input validation
```

## Key Components

### Dashboard
```typescript
// Dashboard.tsx
const Dashboard: React.FC = () => {
  const { metrics, trends, insights } = useAnalysisDashboard();
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <MetricsGrid metrics={metrics} />
      <TrendsCharts trends={trends} />
      <InsightsPanel insights={insights} />
    </div>
  );
};
```

### Agent Communication
```typescript
// AgentService.ts
class AgentService {
  private static instance: AgentService;
  private messageQueue: Map<string, AgentMessage>;
  private activeConnections: Map<string, WebSocket>;
  
  async sendMessage(message: AgentMessage): Promise<string>
  async queryAgent(target: string, action: string, data: any): Promise<any>
  subscribeToAgent(agentId: string, eventType: string, callback: Function): Function
}
```

## State Management

### Context Usage
```typescript
// AgentContext.tsx
const AgentContext = React.createContext<AgentContextType | null>(null);

export const AgentProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(agentReducer, initialState);
  
  return (
    <AgentContext.Provider value={{ state, dispatch }}>
      {children}
    </AgentContext.Provider>
  );
};
```

### Custom Hooks
```typescript
// useAnalysisDashboard.ts
export function useAnalysisDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [trends, setTrends] = useState<DashboardTrends | null>(null);
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  
  // Implementation...
}
```

## Real-time Updates

### WebSocket Integration
```typescript
// websocket.ts
class WebSocketManager {
  private ws: WebSocket;
  private reconnectAttempts: number = 0;
  
  connect() {
    this.ws = new WebSocket(WS_URL);
    this.setupListeners();
  }
  
  private setupListeners() {
    this.ws.onmessage = this.handleMessage;
    this.ws.onclose = this.handleClose;
    this.ws.onerror = this.handleError;
  }
}
```

### Real-time Charts
```typescript
// TrendsChart.tsx
const TrendsChart: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

## Error Handling

### Error Boundaries
```typescript
// ErrorBoundary.tsx
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError(error, errorInfo);
  }
}
```

### Error States
```typescript
// useError.ts
export function useError() {
  const [error, setError] = useState<Error | null>(null);
  
  const handleError = useCallback((error: Error) => {
    setError(error);
    logError(error);
  }, []);
  
  return { error, handleError };
}
```

## Performance Optimization

### Memoization
```typescript
// MemoizedComponent.tsx
const MemoizedChart = React.memo(({ data }) => {
  return <TrendsChart data={data} />;
});
```

### Code Splitting
```typescript
// App.tsx
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Assessment = React.lazy(() => import('./components/Assessment'));
```

## Testing

### Component Tests
```typescript
// Dashboard.test.tsx
describe('Dashboard', () => {
  it('renders metrics correctly', () => {
    render(<Dashboard />);
    expect(screen.getByText('Active Clients')).toBeInTheDocument();
  });
});
```

### Hook Tests
```typescript
// useAgent.test.ts
describe('useAgent', () => {
  it('handles messages correctly', async () => {
    const { result } = renderHook(() => useAgent('test-agent'));
    await result.current.sendMessage({ type: 'TEST' });
  });
});
```

## Styling

### Tailwind Usage
```typescript
// component.tsx
<div className="
  bg-white 
  rounded-lg 
  shadow-md 
  p-6 
  hover:shadow-lg 
  transition-shadow
">
  Content
</div>
```

### Theme Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#0066cc',
        secondary: '#4a5568'
      }
    }
  }
};
```

## Best Practices

### Code Organization
1. Group by feature
2. Keep components small
3. Use TypeScript
4. Document public APIs
5. Write tests

### Performance
1. Memoize expensive calculations
2. Implement virtualization for long lists
3. Use code splitting
4. Optimize images

### Security
1. Sanitize inputs
2. Implement CSRF protection
3. Use HTTPS
4. Validate data

## Deployment

### Build Process
```bash
# Production build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

### Environment Configuration
```env
REACT_APP_API_URL=https://api.example.com
REACT_APP_WS_URL=wss://ws.example.com
```

## Future Improvements

### Planned Features
1. Enhanced real-time capabilities
2. Mobile optimization
3. Offline support
4. Advanced caching

### Technical Debt
1. Improve test coverage
2. Enhance error handling
3. Optimize bundle size
4. Add performance monitoring