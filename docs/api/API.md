# API Documentation

## Overview
Delilah Agentic's API is built with FastAPI, providing real-time clinical data management and AI agent integration.

## Base URL
```
Development: http://localhost:8000
Production: https://api.delilah-agentic.com
```

## Authentication
```http
Authorization: Bearer <jwt_token>
```

## Endpoints

### Authentication
```http
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

### Clients
```http
GET    /api/clients
POST   /api/clients
GET    /api/clients/{client_id}
PUT    /api/clients/{client_id}
DELETE /api/clients/{client_id}
```

### Assessments
```http
GET    /api/assessments
POST   /api/assessments
GET    /api/assessments/{assessment_id}
PUT    /api/assessments/{assessment_id}
DELETE /api/assessments/{assessment_id}
```

### Agent Communication
```http
WebSocket /api/agents/ws
POST      /api/agents/query
GET       /api/agents/status
```

## Request/Response Examples

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}
```

Response:
```json
{
  "access_token": "eyJ0eXAi...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### Client Management

#### Create Client
```http
POST /api/clients
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "status": "active"
}
```

Response:
```json
{
  "id": "client_123",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "status": "active",
  "created_at": "2024-12-29T12:00:00Z"
}
```

### Assessment Management

#### Create Assessment
```http
POST /api/assessments
Authorization: Bearer <token>
Content-Type: application/json

{
  "client_id": "client_123",
  "type": "initial",
  "status": "pending",
  "fields": {
    "presenting_problem": "text here",
    "risk_factors": ["factor1", "factor2"]
  }
}
```

Response:
```json
{
  "id": "assessment_456",
  "client_id": "client_123",
  "type": "initial",
  "status": "pending",
  "fields": {
    "presenting_problem": "text here",
    "risk_factors": ["factor1", "factor2"]
  },
  "created_at": "2024-12-29T12:00:00Z"
}
```

### Agent Communication

#### WebSocket Connection
```javascript
const ws = new WebSocket('ws://localhost:8000/api/agents/ws');
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  // Handle message
};
```

#### Agent Query
```http
POST /api/agents/query
Authorization: Bearer <token>
Content-Type: application/json

{
  "agent": "analysis_agent",
  "action": "GET_DASHBOARD_METRICS",
  "data": {
    "timeframe": "last_7_days"
  }
}
```

Response:
```json
{
  "metrics": {
    "activeClients": {
      "count": 42,
      "trend": 2
    },
    "pendingAssessments": {
      "count": 7,
      "priority": 3
    }
  }
}
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {
      "field": "Additional information"
    }
  }
}
```

### Common Error Codes
- AUTH_001: Authentication failed
- AUTH_002: Token expired
- CLIENT_001: Client not found
- ASSESSMENT_001: Invalid assessment data
- AGENT_001: Agent communication error

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Pagination
```http
GET /api/clients?page=2&per_page=20
```

Response:
```json
{
  "data": [...],
  "meta": {
    "current_page": 2,
    "per_page": 20,
    "total_pages": 5,
    "total_items": 97
  }
}
```

## Data Models

### Client
```typescript
interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}
```

### Assessment
```typescript
interface Assessment {
  id: string;
  client_id: string;
  type: 'initial' | 'followup' | 'discharge';
  status: 'pending' | 'in_progress' | 'completed';
  fields: Record<string, any>;
  created_at: string;
  updated_at: string;
}
```

### Agent Message
```typescript
interface AgentMessage {
  id: string;
  type: string;
  source: string;
  target: string;
  payload: any;
  timestamp: string;
}
```

## WebSocket Events

### Client Events
- `client.updated`
- `client.status_changed`
- `client.assessment_added`

### Assessment Events
- `assessment.created`
- `assessment.updated`
- `assessment.completed`

### Agent Events
- `agent.insight_generated`
- `agent.analysis_completed`
- `agent.error_occurred`

## Security

### CORS Configuration
```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Input Validation
All endpoints perform strict input validation using Pydantic models.

### Rate Limiting
Implements token bucket algorithm with Redis backend.

## Development Guidelines

### Testing
```bash
# Run API tests
pytest tests/api/

# Test specific endpoint
pytest tests/api/test_clients.py
```

### Documentation Updates
1. Update OpenAPI schema
2. Update markdown documentation
3. Update postman collection

### Error Handling
```python
@app.exception_handler(CustomException)
async def custom_exception_handler(request: Request, exc: CustomException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.to_dict()}
    )
```

## Monitoring

### Metrics
- Request count
- Response times
- Error rates
- Active WebSocket connections

### Logging
```python
logger.info("API request", extra={
    "endpoint": "/api/clients",
    "method": "POST",
    "status": 201,
    "duration_ms": 45
})
```

## Future Improvements

### Planned Features
1. GraphQL integration
2. Enhanced real-time capabilities
3. Advanced caching
4. Analytics endpoints

### Performance Optimization
1. Query optimization
2. Caching strategy
3. Connection pooling
4. Load balancing