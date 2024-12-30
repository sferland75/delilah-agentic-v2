# API Documentation

[Previous content remains the same...]

    "id": "assessment_456",
    "client_id": "client_123",
    "type": "initial",
    "status": "pending",
    "created_at": "2024-12-29T12:00:00Z",
    "fields": {
      // Assessment fields
    },
    "analysis": {
      // AI-generated analysis
    }
  }
}
```

### WebSocket Event Types

#### Metrics Updates
```typescript
{
  "type": "EVENT",
  "source": {
    "type": "AGENT",
    "id": "analysis-agent"
  },
  "payload": {
    "type": "METRICS_UPDATE",
    "data": {
      "activeClients": {
        "count": 43,  // Updated count
        "trend": 3    // Updated trend
      }
    }
  }
}
```

#### Assessment Status Updates
```typescript
{
  "type": "EVENT",
  "source": {
    "type": "AGENT",
    "id": "assessment-agent"
  },
  "payload": {
    "type": "ASSESSMENT_UPDATE",
    "data": {
      "id": "assessment_456",
      "status": "completed",
      "completedAt": "2024-12-29T12:30:00Z"
    }
  }
}
```

#### Insight Updates
```typescript
{
  "type": "EVENT",
  "source": {
    "type": "AGENT",
    "id": "analysis-agent"
  },
  "payload": {
    "type": "INSIGHT_UPDATE",
    "data": {
      "type": "risk_factor",
      "priority": "high",
      "description": "New high priority insight",
      "recommendations": [
        "Immediate action recommended"
      ]
    }
  }
}
```

### Connection Management

#### Heartbeat
```typescript
// Client -> Server (every 30 seconds)
{
  "type": "HEARTBEAT",
  "id": "heartbeat_123",
  "timestamp": "2024-12-29T12:00:00Z"
}

// Server -> Client
{
  "type": "HEARTBEAT_ACK",
  "id": "heartbeat_123",
  "timestamp": "2024-12-29T12:00:00Z"
}
```

#### Reconnection
```typescript
// On reconnection, client should:
{
  "type": "RECONNECT",
  "id": "reconnect_123",
  "payload": {
    "lastMessageId": "msg_130",
    "subscriptions": [
      "METRICS_UPDATE",
      "ASSESSMENT_UPDATE"
    ]
  }
}
```

### Error Scenarios

#### Validation Error
```typescript
{
  "type": "ERROR",
  "id": "error_123",
  "payload": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid assessment data",
    "details": {
      "field": "client_id",
      "error": "Client not found"
    }
  }
}
```

#### Processing Error
```typescript
{
  "type": "ERROR",
  "id": "error_124",
  "payload": {
    "code": "PROCESSING_ERROR",
    "message": "Failed to process assessment",
    "details": {
      "reason": "Analysis agent unavailable",
      "retryAfter": 5000
    }
  }
}
```

### Authentication

#### Initial Authentication
```typescript
// After WebSocket connection
{
  "type": "AUTH",
  "id": "auth_123",
  "payload": {
    "token": "jwt_token_here"
  }
}

// Success response
{
  "type": "AUTH_SUCCESS",
  "id": "auth_123",
  "payload": {
    "sessionId": "session_456",
    "permissions": ["READ", "WRITE"]
  }
}
```

### Using the API

#### JavaScript Example
```typescript
class AgentAPI {
  private ws: WebSocket;
  private messageHandlers: Map<string, (response: any) => void>;

  constructor() {
    this.ws = new WebSocket('ws://localhost:8000/agents/ws');
    this.messageHandlers = new Map();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const handler = this.messageHandlers.get(message.id);
      if (handler) {
        handler(message.payload);
        this.messageHandlers.delete(message.id);
      }
    };
  }

  async sendMessage(type: string, target: string, action: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = `msg_${Date.now()}`;
      const message = {
        id,
        type,
        target: {
          type: 'AGENT',
          id: target
        },
        action,
        payload: data
      };

      this.messageHandlers.set(id, resolve);
      this.ws.send(JSON.stringify(message));

      // Timeout after 30 seconds
      setTimeout(() => {
        this.messageHandlers.delete(id);
        reject(new Error('Request timeout'));
      }, 30000);
    });
  }
}

// Usage example
const api = new AgentAPI();

async function getDashboardMetrics() {
  try {
    const metrics = await api.sendMessage(
      'QUERY',
      'analysis-agent',
      'GET_DASHBOARD_METRICS',
      { timeframe: 'current' }
    );
    console.log('Dashboard metrics:', metrics);
  } catch (error) {
    console.error('Failed to get metrics:', error);
  }
}
```

### Best Practices

1. Message Handling
```typescript
// Always include error handling
try {
  const response = await api.sendMessage(...);
} catch (error) {
  if (error.code === 'TIMEOUT_ERROR') {
    // Handle timeout
  } else if (error.code === 'VALIDATION_ERROR') {
    // Handle validation error
  }
}
```

2. Reconnection Strategy
```typescript
// Implement exponential backoff
function setupWebSocket() {
  let retryCount = 0;
  const maxRetries = 5;

  function connect() {
    const ws = new WebSocket(WS_URL);
    
    ws.onclose = () => {
      if (retryCount < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
        setTimeout(connect, delay);
        retryCount++;
      }
    };
  }

  connect();
}
```

3. Subscription Management
```typescript
const subscriptions = new Set<string>();

function subscribe(eventType: string) {
  subscriptions.add(eventType);
  return () => {
    subscriptions.delete(eventType);
  };
}

// On reconnection
ws.onopen = () => {
  api.sendMessage('COMMAND', 'analysis-agent', 'SUBSCRIBE', {
    events: Array.from(subscriptions)
  });
};
```

### Rate Limiting

The API implements rate limiting with the following constraints:
- Maximum 100 messages per minute per client
- Maximum 10 concurrent subscriptions
- Maximum message size: 100KB

When rate limit is exceeded:
```typescript
{
  "type": "ERROR",
  "payload": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "details": {
      "retryAfter": 60000,
      "limit": 100,
      "remaining": 0
    }
  }
}
```