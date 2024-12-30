# AI Agent Documentation

## Overview

The Delilah Agentic system uses a network of specialized AI agents to provide real-time analysis and insights. Each agent has specific responsibilities and communicates through a standardized message protocol.

## Agent Architecture

### Base Agent Class
```python
from typing import Dict, Any, Optional
from abc import ABC, abstractmethod

class BaseAgent(ABC):
    """Base class for all agents in the system."""
    
    def __init__(self):
        self.name = "base_agent"
        self.subscriptions = {}
        self._ready = False

    @abstractmethod
    async def process(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Process incoming messages."""
        pass

    @abstractmethod
    async def validate(self, data: Dict[str, Any]) -> bool:
        """Validate incoming data."""
        pass

    async def initialize(self) -> None:
        """Initialize agent resources."""
        self._ready = True

    async def shutdown(self) -> None:
        """Clean up agent resources."""
        self._ready = False
```

### Analysis Agent
```python
class AnalysisAgent(BaseAgent):
    """Agent responsible for analyzing clinical data and providing insights."""

    def __init__(self):
        super().__init__()
        self.name = "analysis_agent"

    async def process(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Process analysis requests."""
        action = message.get('action')
        
        handlers = {
            'GET_DASHBOARD_METRICS': self.get_dashboard_metrics,
            'GET_DASHBOARD_TRENDS': self.get_dashboard_trends,
            'GET_DASHBOARD_INSIGHTS': self.get_dashboard_insights,
            'ANALYZE_PATTERNS': self.analyze_patterns
        }

        handler = handlers.get(action)
        if not handler:
            raise ValueError(f"Unknown action: {action}")

        return await handler(message.get('data', {}))

    async def get_dashboard_metrics(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Get current metrics for the dashboard."""
        active_clients = await self.db.clients.count_documents({"status": "active"})
        pending_assessments = await self.db.assessments.count_documents({"status": "pending"})
        
        return {
            "activeClients": {
                "count": active_clients,
                "trend": await self._calculate_trend("clients", active_clients)
            },
            "pendingAssessments": {
                "count": pending_assessments,
                "priority": await self._count_high_priority_assessments()
            }
        }
```

### Assessment Agent
```python
class AssessmentAgent(BaseAgent):
    """Agent responsible for processing and analyzing assessments."""

    def __init__(self):
        super().__init__()
        self.name = "assessment_agent"

    async def process(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Process assessment-related requests."""
        action = message.get('action')
        
        handlers = {
            'VALIDATE_ASSESSMENT': self.validate_assessment,
            'ANALYZE_ASSESSMENT': self.analyze_assessment,
            'GENERATE_REPORT': self.generate_report
        }

        handler = handlers.get(action)
        if not handler:
            raise ValueError(f"Unknown action: {action}")

        return await handler(message.get('data', {}))

    async def validate_assessment(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate assessment data."""
        validation_results = []
        
        # Validate required fields
        required_fields = ['client_id', 'assessment_type', 'responses']
        for field in required_fields:
            if field not in data:
                validation_results.append({
                    'field': field,
                    'error': 'Required field missing'
                })

        # Validate responses
        if 'responses' in data:
            for response in data['responses']:
                if not self._validate_response(response):
                    validation_results.append({
                        'field': f"responses.{response['id']}",
                        'error': 'Invalid response format'
                    })

        return {
            'valid': len(validation_results) == 0,
            'errors': validation_results
        }
```

## Agent Communication

### Message Protocol
```python
# Message format
message = {
    'id': 'msg_123',
    'type': 'QUERY',
    'source': {
        'type': 'FRONTEND',
        'id': 'dashboard'
    },
    'target': {
        'type': 'AGENT',
        'id': 'analysis_agent'
    },
    'action': 'GET_DASHBOARD_METRICS',
    'payload': {
        # Action-specific data
    }
}

# Response format
response = {
    'id': 'msg_123',
    'type': 'RESPONSE',
    'source': {
        'type': 'AGENT',
        'id': 'analysis_agent'
    },
    'payload': {
        # Response data
    }
}
```

### Error Handling
```python
class AgentError(Exception):
    """Base class for agent-related errors."""
    
    def __init__(self, message: str, code: str, details: Optional[Dict] = None):
        super().__init__(message)
        self.code = code
        self.details = details or {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            'code': self.code,
            'message': str(self),
            'details': self.details
        }

class ValidationError(AgentError):
    """Raised when data validation fails."""
    
    def __init__(self, message: str, details: Optional[Dict] = None):
        super().__init__(message, 'VALIDATION_ERROR', details)

class ProcessingError(AgentError):
    """Raised when agent processing fails."""
    
    def __init__(self, message: str, details: Optional[Dict] = None):
        super().__init__(message, 'PROCESSING_ERROR', details)
```

## Agent Implementation Guide

### Creating a New Agent
1. Inherit from BaseAgent
2. Implement required methods
3. Define message handlers
4. Add error handling

```python
class NewAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.name = "new_agent"

    async def process(self, message: Dict[str, Any]) -> Dict[str, Any]:
        try:
            # Validate message
            if not await self.validate(message):
                raise ValidationError("Invalid message format")

            # Process message
            action = message.get('action')
            handler = self._get_handler(action)
            return await handler(message.get('data', {}))

        except Exception as e:
            raise ProcessingError(f"Processing failed: {str(e)}")

    async def validate(self, data: Dict[str, Any]) -> bool:
        # Implement validation logic
        return True

    def _get_handler(self, action: str):
        handlers = {
            'ACTION_1': self._handle_action_1,
            'ACTION_2': self._handle_action_2
        }
        return handlers.get(action)
```

### Testing Agents
```python
import pytest
from your_agent import NewAgent

@pytest.mark.asyncio
async def test_agent_processing():
    agent = NewAgent()
    message = {
        'action': 'ACTION_1',
        'data': {
            'key': 'value'
        }
    }
    
    result = await agent.process(message)
    assert result['status'] == 'success'
```

## Agent Performance Optimization

### Caching
```python
from functools import lru_cache
from datetime import timedelta

class CachingAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.cache_ttl = timedelta(minutes=5)

    @lru_cache(maxsize=1000)
    async def _cached_operation(self, key: str) -> Any:
        # Expensive operation
        result = await self._compute_result(key)
        return result
```

### Batch Processing
```python
class BatchProcessor:
    def __init__(self, max_batch_size: int = 100):
        self.batch = []
        self.max_batch_size = max_batch_size

    async def add(self, item: Any):
        self.batch.append(item)
        if len(self.batch) >= self.max_batch_size:
            await self.process_batch()

    async def process_batch(self):
        if not self.batch:
            return
        
        # Process batch
        results = await self._process_items(self.batch)
        self.batch = []
        return results
```

## Agent Monitoring

### Performance Metrics
```python
import time
from dataclasses import dataclass
from typing import Optional

@dataclass
class OperationMetrics:
    operation: str
    duration: float
    success: bool
    error: Optional[str] = None

class MonitoredAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.metrics = []

    async def _record_operation(self, operation: str):
        start_time = time.time()
        try:
            result = await self._perform_operation(operation)
            duration = time.time() - start_time
            self.metrics.append(OperationMetrics(
                operation=operation,
                duration=duration,
                success=True
            ))
            return result
        except Exception as e:
            duration = time.time() - start_time
            self.metrics.append(OperationMetrics(
                operation=operation,
                duration=duration,
                success=False,
                error=str(e)
            ))
            raise
```

## Integration Points

### Database Integration
```python
from motor.motor_asyncio import AsyncIOMotorClient

class DatabaseAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.db = None

    async def initialize(self):
        self.db = AsyncIOMotorClient()['database_name']
        await super().initialize()

    async def shutdown(self):
        self.db.client.close()
        await super().shutdown()
```

### Event System
```python
from typing import Callable, List

class EventSystem:
    def __init__(self):
        self.subscribers: Dict[str, List[Callable]] = {}

    async def publish(self, event: str, data: Any):
        if event in self.subscribers:
            for subscriber in self.subscribers[event]:
                await subscriber(data)

    def subscribe(self, event: str, callback: Callable):
        if event not in self.subscribers:
            self.subscribers[event] = []
        self.subscribers[event].append(callback)
```

## Best Practices

1. Message Validation
```python
def validate_message(message: Dict[str, Any]) -> bool:
    required_fields = ['id', 'type', 'action']
    return all(field in message for field in required_fields)
```

2. Error Handling
```python
async def safe_process(self, message: Dict[str, Any]) -> Dict[str, Any]:
    try:
        return await self.process(message)
    except ValidationError as e:
        return {'error': {'type': 'validation', 'details': str(e)}}
    except ProcessingError as e:
        return {'error': {'type': 'processing', 'details': str(e)}}
```

3. Resource Management
```python
async def __aenter__(self):
    await self.initialize()
    return self

async def __aexit__(self, exc_type, exc_val, exc_tb):
    await self.shutdown()
```

4. Logging
```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LoggedAgent(BaseAgent):
    async def process(self, message: Dict[str, Any]) -> Dict[str, Any]:
        logger.info(f"Processing message: {message['id']}")
        try:
            result = await super().process(message)
            logger.info(f"Successfully processed message: {message['id']}")
            return result
        except Exception as e:
            logger.error(f"Error processing message {message['id']}: {str(e)}")
            raise
```