# Delilah Agentic

An AI-powered clinical management system with real-time analysis capabilities for therapeutic practices.

## Core Features

### 1. AI-Enhanced Dashboard
- Real-time metrics and insights
- Predictive analytics
- Workload optimization
- Risk assessment

### 2. Agent System
- Analysis agent for data processing
- Real-time communication
- Pattern recognition
- Automated insights

### 3. Client Management
- Comprehensive client profiles
- Progress tracking
- Assessment management
- Treatment planning

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.12+
- PostgreSQL 16+
- Git

### Installation

1. **Clone Repository**
   ```bash
   git clone [repository-url]
   cd delilah-agentic
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   ```

4. **Database Setup**
   ```bash
   # Update .env with your PostgreSQL credentials
   python init_db.py
   ```

5. **Start Services**
   ```bash
   # Start backend
   uvicorn main:app --reload

   # Start frontend (new terminal)
   cd frontend
   npm start
   ```

## Architecture

### Frontend
- React 18 with TypeScript
- Real-time data with WebSocket
- Tailwind CSS for styling
- Recharts for visualization

### Backend
- FastAPI for API
- PostgreSQL database
- Agent-based architecture
- Async processing

### Agent System
- Base agent infrastructure
- Analysis capabilities
- Event-driven communication
- Real-time processing

## Project Structure
```
delilah-agentic/
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API services
│   │   └── types/        # TypeScript definitions
│   └── package.json
├── backend/
│   ├── api/             # API endpoints
│   ├── agents/          # AI agents
│   ├── database/        # Database models
│   └── services/        # Business logic
└── docs/               # Documentation
```

## Development Workflow

1. **Feature Development**
   - Create feature branch
   - Implement changes
   - Add tests
   - Submit PR

2. **Testing**
   ```bash
   # Frontend tests
   cd frontend
   npm test

   # Backend tests
   cd backend
   pytest
   ```

3. **Documentation**
   - Update relevant .md files
   - Add code comments
   - Update API docs

## Available Scripts

### Frontend
- `npm start`: Start development server
- `npm test`: Run tests
- `npm run build`: Build for production
- `npm run lint`: Lint code

### Backend
- `uvicorn main:app --reload`: Start API server
- `pytest`: Run tests
- `black .`: Format code
- `mypy .`: Type check

## Configuration

### Environment Variables
Create a `.env` file:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/delilah
API_KEY=your_api_key
WEBSOCKET_URL=ws://localhost:8000/ws
```

## Contributing
1. Check [DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md)
2. Pick an open task
3. Create feature branch
4. Submit PR

## Documentation
- [Development Status](DEVELOPMENT_STATUS.md)
- [API Documentation](docs/API.md)
- [Agent System](docs/AGENTS.md)

## Support
- Create an issue
- Contact development team

## License
Proprietary License - All Rights Reserved