from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID, uuid4
import asyncio
from coordinator import AgentCoordinator

app = FastAPI()

class ClientSearch(BaseModel):
    query: str

@app.get('/')
def read_root():
    return {'message': 'Delilah Agentic API is running'}

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)