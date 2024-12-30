from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio

from .routes import websocket
from .utils.message_handler import message_handler

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(websocket.router)

@app.on_event("startup")
async def startup_event():
    # Start message handler
    await message_handler.start()

@app.on_event("shutdown")
async def shutdown_event():
    # Stop message handler
    await message_handler.stop()