# Delilah Agentic Quick Start Guide

## Current Development Status
The project is a clinical management system with AI-assisted analysis. Currently implemented:
- Dashboard with mock data
- Agent communication infrastructure
- Real-time updates structure
- TypeScript integration

## Setup Development Environment

### 1. Prerequisites
```bash
# Required versions
Node.js 18+
Python 3.12+
PostgreSQL 16+
```

### 2. Initial Setup
```bash
# Clone repository
git clone [repository-url]
cd delilah-agentic

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
```

### 3. Environment Configuration
Create `.env` file in root directory:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/delilah

# Agent Configuration
AGENT_WS_URL=ws://localhost:8000/agents/ws
AGENT_RESPONSE_TIMEOUT=30000

# Development
DEBUG=true
```

### 4. Start Development Servers
```bash
# Terminal 1: Start backend
python run.py

# Terminal 2: Start frontend
cd frontend
npm start
```

## Current Architecture

### Frontend Structure
```
frontend/src/
├── components/
│   ├── dashboard/       # Dashboard components
│   │   ├── MetricsGrid.tsx
│   │   ├── TrendsChart.tsx
│   │   └── InsightsPanel.tsx
│   └── common/         # Shared components
├── hooks/
│   └── useAgent.ts     # Agent communication
└── services/
    └── AgentService.ts # Agent service
```

### Agent Communication
```typescript
// Example agent query
const { data, loading, error } = useAgent('analysis-agent');

// Subscribe to updates
useEffect(() => {
  const unsubscribe = agentService.subscribeToAgent(
    'metrics',
    handleUpdate
  );
  return () => unsubscribe();
}, []);
```

## Current Features

### Dashboard
- Metrics display
- Trends visualization
- AI insights panel
- Real-time update structure

### Agent Integration
- WebSocket setup
- Message handling
- Error management
- State synchronization

## Immediate Next Steps

### 1. Agent Integration
Currently using mock data. Need to:
- Connect to real agent endpoints
- Implement message handling
- Add error recovery
- Set up proper state management

### 2. Real-time Updates
Structure is ready. Need to:
- Implement WebSocket connection
- Add message queueing
- Handle connection drops
- Add offline support

### 3. Data Management
Need to implement:
- Proper caching
- Optimistic updates
- Conflict resolution
- Error recovery

## Development Workflow

### 1. Making Changes
```bash
# Create feature branch
git checkout -b feature/your-feature

# Run tests
npm test
```

### 2. Testing
```bash
# Run all tests
npm test

# Run specific test
npm test -- -t "test name"
```

### 3. Type Checking
```bash
# Check types
npm run type-check

# Generate types
npm run generate-types
```

## Common Tasks

### Adding New Component
1. Create component in appropriate directory
2. Add TypeScript interfaces
3. Add tests
4. Update documentation

### Modifying Agent Communication
1. Update AgentService.ts
2. Update useAgent.ts hook
3. Update type definitions
4. Add error handling

### Adding New Feature
1. Check DEVELOPMENT_STATUS.md
2. Create feature branch
3. Implement changes
4. Add tests
5. Update documentation

## Troubleshooting

### Common Issues

1. WebSocket Connection
```typescript
// Check connection status
agentService.getConnectionStatus();

// Manual reconnect
agentService.reconnect();
```

2. Type Errors
```bash
# Regenerate types
npm run generate-types

# Check specific file
npx tsc path/to/file.ts --noEmit
```

3. Build Issues
```bash
# Clean install
rm -rf node_modules
npm install

# Clear cache
npm run clean-cache
```

## Getting Help
- Check documentation in /docs
- Review DEVELOPMENT_STATUS.md
- Check GitHub issues
- Contact team lead

## Next Development Phase
Focus on:
1. Agent integration
2. Real-time updates
3. Error handling
4. Performance optimization

## Resources
- [Development Status](DEVELOPMENT_STATUS.md)
- [API Documentation](docs/API.md)
- [Component Guide](docs/COMPONENTS.md)
- [Testing Guide](docs/TESTING.md)