from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.core.config import settings
from api.core.error_handling.base import DelilahError, ErrorHandler
from api.core.error_handling.errors import InternalServerError
from api.routes import assessment, documentation, analysis, report
from coordinator import AgentCoordinator
from datetime import datetime
import logging
import asyncio

# Setup logging
logger = logging.getLogger(__name__)

# Initialize coordinator
coordinator = AgentCoordinator()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="FastAPI-based Occupational Therapy Assessment System"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    assessment.router,
    prefix="/api/v1/assessments",
    tags=["Assessments"]
)

app.include_router(
    documentation.router,
    prefix="/api/v1/documentation",
    tags=["Documentation"]
)

app.include_router(
    analysis.router,
    prefix="/api/v1/analysis",
    tags=["Analysis"]
)

app.include_router(
    report.router,
    prefix="/api/v1/reports",
    tags=["Reports"]
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    if isinstance(exc, DelilahError):
        return exc
    return InternalServerError(str(exc))

@app.on_event("startup")
async def startup_event():
    """Start the coordinator on application startup"""
    logger.info("Starting Delilah Agentic System")
    
    # Start coordinator in background task
    asyncio.create_task(coordinator.start())
    
    logger.info("Coordinator started successfully")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown"""
    logger.info("Shutting down Delilah Agentic System")

@app.get("/health", tags=["Health"])
async def health_check():
    """Check API health status."""
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Welcome to Delilah Agentic API",
        "version": settings.VERSION,
        "documentation": "/docs"
    }