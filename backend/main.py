from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import router as api_router

app = FastAPI(title="Delilah Agentic API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API routes
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {
        "status": "Server is running",
        "version": "0.1.0"
    }