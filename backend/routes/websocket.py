from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
from typing import List

from ..utils.message_handler import message_handler

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    queue = asyncio.Queue()
    message_handler.add_connection(queue)
    
    try:
        while True:
            # Send messages from queue to client
            message = await queue.get()
            await websocket.send_text(message)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        message_handler.remove_connection(queue)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)
        message_handler.remove_connection(queue)