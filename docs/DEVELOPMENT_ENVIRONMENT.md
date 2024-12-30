# Development Environment Setup

## Prerequisites

### Required Software
- Python 3.12+
- Node.js 18+
- PostgreSQL 16+
- Git
- VS Code (recommended) or preferred IDE

### Recommended VS Code Extensions
- Python
- ESLint
- Prettier
- SQLTools
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

## Initial Setup

### 1. Repository Setup
```bash
# Clone repository
git clone [repository-url]
cd delilah-agentic

# Create Python virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/delilah

# API Configuration
API_PORT=8000
DEBUG=True

# WebSocket Configuration
WEBSOCKET_URL=ws://localhost:8000/ws

# Agent Configuration
AGENT_RESPONSE_TIMEOUT=30
```

### 3. Database Setup
```bash
# Create database
createdb delilah

# Run migrations
alembic upgrade head

# Seed initial data (if needed)
python scripts/seed_data.py
```

### 4. Frontend Setup
```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm start
```

### 5. Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Start development server
uvicorn main:app --reload
```

## Development Workflow

### 1. Branch Management
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Keep branch updated
git fetch origin
git rebase origin/main
```

### 2. Code Quality Tools
```bash
# Python linting
black .
flake8

# TypeScript/JavaScript linting
npm run lint
npm run format
```

### 3. Running Tests
```bash
# Backend tests
pytest

# Frontend tests
npm test
```

## Common Development Tasks

### Working with Agents

1. Creating a New Agent
```python
# agents/my_new_agent.py
from .base import BaseAgent

class MyNewAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.name = "my_new_agent"

    async def process(self, message):
        # Implementation
        pass
```

2. Testing Agent Communication
```python
# Test WebSocket connection
ws = await websockets.connect('ws://localhost:8000/ws')
await ws.send(json.dumps({
    'type': 'COMMAND',
    'agent': 'analysis_agent',
    'action': 'GET_METRICS'
}))
```

### Working with the Frontend

1. Creating New Components
```typescript
// components/MyComponent.tsx
import React from 'react';

interface Props {
  data: any;
}

const MyComponent: React.FC<Props> = ({ data }) => {
  return (
    <div className="p-4">
      {/* Implementation */}
    </div>
  );
};

export default MyComponent;
```

2. Using Agent Communication
```typescript
// hooks/useMyAgent.ts
import { useAgent } from './useAgent';

export function useMyAgent() {
  const { queryAgent } = useAgent('my-agent', null, {
    priority: Priority.HIGH
  });

  // Implementation
}
```

## Debugging Tips

### Backend Debugging
```python
# Using debugger
import pdb; pdb.set_trace()

# Enhanced logging
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Frontend Debugging
```typescript
// Console debugging
console.log('Debug:', data);

// React DevTools
// Use React Developer Tools browser extension
```

### WebSocket Debugging
```javascript
// Browser console
ws = new WebSocket('ws://localhost:8000/ws');
ws.onmessage = console.log;
ws.send(JSON.stringify({type: 'TEST'}));
```

## Common Issues & Solutions

### 1. Database Connection
Issue: Unable to connect to database
```bash
# Check PostgreSQL service
pg_ctl status

# Verify connection string
psql "postgresql://user:password@localhost:5432/delilah"
```

### 2. WebSocket Connection
Issue: WebSocket connection failing
```javascript
// Verify WebSocket URL matches environment config
// Check CORS settings in backend
// Ensure backend is running
```

### 3. TypeScript Errors
Issue: Type definition not found
```bash
# Update type definitions
npm install @types/missing-package

# Regenerate type declarations
npm run types
```

## IDE Configuration

### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "python.formatting.provider": "black",
  "python.linting.enabled": true,
  "typescript.updateImportsOnFileMove.enabled": "always"
}
```

### ESLint Configuration
```json
{
  "extends": [
    "react-app",
    "react-app/jest"
  ],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

## Local Tools

### Database Tools
```bash
# pgAdmin or DBeaver for database management
# Table Plus for visual database management
```

### API Testing
```bash
# Use Thunder Client VS Code extension
# or Postman for API testing
```

## Best Practices

### 1. Code Organization
- Keep components small and focused
- Use TypeScript consistently
- Follow project structure
- Document complex logic

### 2. State Management
- Use hooks for local state
- Context for shared state
- Agent communication for real-time updates

### 3. Testing
- Write tests for new features
- Update existing tests when changing functionality
- Use meaningful test names

### 4. Git Workflow
- Clear commit messages
- Regular small commits
- Keep PRs focused
- Update documentation

## Support Resources

### Project Documentation
- README.md: Project overview
- DEVELOPMENT_STATUS.md: Current status
- docs/: Detailed documentation

### Team Communication
- GitHub Issues for tasks
- Pull Requests for code review
- Team chat for quick questions

### External Resources
- React Documentation
- FastAPI Documentation
- PostgreSQL Documentation
- TypeScript Handbook