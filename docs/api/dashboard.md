# Dashboard API

## Endpoints

### Get Dashboard Data
```http
GET /api/dashboard
```

Returns all data needed for dashboard display.

**Response:**
```json
{
  "metrics": {
    "activeClients": {
      "value": 42,
      "change": 2,
      "period": "this week"
    },
    "pendingAssessments": {
      "value": 7,
      "priority": 3
    },
    "scheduledHours": {
      "value": 28,
      "nextWeek": 32
    },
    "reportsDue": {
      "value": 5,
      "urgent": 2
    }
  },
  "trends": {
    "completed": [[timestamp, value], ...],
    "pending": [[timestamp, value], ...],
    "predicted": [[timestamp, value], ...]
  },
  "insights": {
    "riskFactors": [{
      "type": "workload_alert",
      "message": "Increased intake rate detected",
      "recommendations": [...]
    }],
    "status": "Moderate workload with some attention needed",
    "actionItems": [...],
    "attentionAreas": [...]
  }
}
```

### Get Real-time Updates
```http
WebSocket: ws://localhost:8000/ws/dashboard
```

Provides real-time updates for dashboard metrics.

**Message Format:**
```json
{
  "type": "METRIC_UPDATE",
  "metric": "activeClients",
  "value": 43,
  "change": 1
}
```

## Development Usage

### Local Testing
```bash
# Test endpoint
curl http://localhost:8000/api/dashboard

# WebSocket connection (using wscat)
wscat -c ws://localhost:8000/ws/dashboard
```

### Error Handling
Standard error responses as per API.md, plus:
- 503: AI Insights temporarily unavailable
- 504: Prediction service timeout