# Testing Guidelines

## Overview

### Testing Stack
- Frontend: Jest, React Testing Library
- Backend: Pytest, AsyncIO Testing
- E2E: Playwright
- Coverage: Jest Coverage, Coverage.py

## Frontend Testing

### Component Testing Strategy
```typescript
// components/__tests__/MetricsGrid.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MetricsGrid } from '../dashboard/MetricsGrid';

describe('MetricsGrid', () => {
  const mockMetrics = {
    activeClients: { count: 42, trend: 2 },
    pendingAssessments: { count: 7, priority: 3 },
    scheduledHours: { count: 28, nextWeek: 32 },
    reportsToComplete: { count: 5, priority: 2 }
  };

  it('renders all metrics correctly', () => {
    render(<MetricsGrid metrics={mockMetrics} />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<MetricsGrid metrics={mockMetrics} onClientClick={handleClick} />);
    fireEvent.click(screen.getByText('Active Clients'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Hook Testing
```typescript
// hooks/__tests__/useAgent.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useAgent } from '../useAgent';

describe('useAgent', () => {
  const mockData = { /* mock data */ };

  beforeEach(() => {
    // Setup mocks
    jest.spyOn(global, 'fetch').mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData)
      })
    );
  });

  it('fetches and updates data', async () => {
    const { result, waitForNextUpdate } = renderHook(() => 
      useAgent('analysis-agent')
    );

    expect(result.current.loading).toBe(true);
    await waitForNextUpdate();
    expect(result.current.data).toEqual(mockData);
  });
});
```

### Service Testing
```typescript
// services/__tests__/AgentService.test.ts
describe('AgentService', () => {
  let service: AgentService;
  let mockWebSocket: WebSocket;

  beforeEach(() => {
    mockWebSocket = {
      send: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      close: jest.fn()
    };
    global.WebSocket = jest.fn(() => mockWebSocket);
    service = new AgentService();
  });

  it('sends messages correctly', async () => {
    await service.sendMessage({ type: 'TEST' });
    expect(mockWebSocket.send).toHaveBeenCalled();
  });
});
```

## Backend Testing

### Agent Testing
```python
# tests/agents/test_analysis_agent.py
import pytest
from agents.analysis_agent import AnalysisAgent

@pytest.mark.asyncio
async def test_analysis_agent():
    agent = AnalysisAgent()
    message = {
        'action': 'GET_DASHBOARD_METRICS',
        'data': {}
    }
    
    result = await agent.process(message)
    assert 'metrics' in result
    assert 'activeClients' in result['metrics']

@pytest.mark.asyncio
async def test_error_handling():
    agent = AnalysisAgent()
    with pytest.raises(ValueError):
        await agent.process({'action': 'INVALID_ACTION'})
```

### API Testing
```python
# tests/api/test_websocket.py
import pytest
from fastapi.testclient import TestClient
from fastapi.websockets import WebSocket

async def test_websocket_connection(client: TestClient):
    with client.websocket_connect("/agents/ws") as websocket:
        data = {"type": "TEST"}
        await websocket.send_json(data)
        response = await websocket.receive_json()
        assert response["status"] == "success"
```

## Integration Testing

### WebSocket Integration
```typescript
// tests/integration/websocket.test.ts
describe('WebSocket Integration', () => {
  let ws: WebSocket;

  beforeEach(async () => {
    ws = new WebSocket('ws://localhost:8000/agents/ws');
    await new Promise(resolve => ws.onopen = resolve);
  });

  afterEach(() => {
    ws.close();
  });

  it('handles real-time updates', async () => {
    const message = { type: 'TEST' };
    ws.send(JSON.stringify(message));
    
    const response = await new Promise(resolve => {
      ws.onmessage = (event) => resolve(JSON.parse(event.data));
    });
    
    expect(response.status).toBe('success');
  });
});
```

### E2E Testing
```typescript
// tests/e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test('dashboard loads and displays data', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Wait for metrics to load
  await expect(page.locator('[data-testid="metrics-grid"]')).toBeVisible();
  
  // Check for specific metrics
  const activeClients = page.locator('[data-testid="active-clients"]');
  await expect(activeClients).toBeVisible();
  
  // Test interactions
  await page.click('[data-testid="refresh-button"]');
  await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
});
```

## Performance Testing

### Load Testing
```typescript
// tests/performance/load.test.ts
import { performance } from 'perf_hooks';

describe('Performance Tests', () => {
  it('handles multiple concurrent requests', async () => {
    const startTime = performance.now();
    
    const requests = Array(100).fill(null).map(() => 
      agentService.queryAgent('TEST_ACTION', {})
    );
    
    await Promise.all(requests);
    
    const duration = performance.now() - startTime;
    expect(duration).toBeLessThan(5000); // 5s limit
  });
});
```

### Memory Testing
```typescript
// tests/performance/memory.test.ts
describe('Memory Usage', () => {
  it('maintains stable memory usage', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Perform operations
    for (let i = 0; i < 1000; i++) {
      await agentService.queryAgent('TEST_ACTION', {});
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const diff = finalMemory - initialMemory;
    
    expect(diff).toBeLessThan(50 * 1024 * 1024); // 50MB limit
  });
});
```

## Test Coverage

### Coverage Requirements
```json
{
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 85,
      "lines": 90,
      "statements": 90
    }
  }
}
```

### Running Coverage
```bash
# Frontend coverage
npm run test:coverage

# Backend coverage
pytest --cov=app --cov-report=html

# E2E coverage
npm run test:e2e -- --coverage
```

## Continuous Integration

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Best Practices

### Test Organization
```
tests/
├── unit/
│   ├── components/
│   ├── hooks/
│   └── services/
├── integration/
│   └── api/
├── e2e/
│   └── flows/
└── performance/
```

### Naming Conventions
```typescript
// Pattern: describe('Component/Feature', () => {
//          it('should behavior when condition', () => {

describe('MetricsGrid', () => {
  it('should display correct values when data is provided', () => {});
  it('should show loading state when fetching data', () => {});
  it('should handle errors when API fails', () => {});
});
```

### Mock Data
```typescript
// tests/mocks/dashboardData.ts
export const mockMetrics = {
  activeClients: { count: 42, trend: 2 },
  pendingAssessments: { count: 7, priority: 3 }
};

export const mockTrends = {
  assessmentTrends: [
    { month: 'Jan', completed: 12, pending: 3 }
  ]
};
```