import asyncio
import json
from typing import Dict, Any, Optional, Set
from datetime import datetime
from uuid import UUID

class MessageHandler:
    def __init__(self):
        self.connections: Set[asyncio.Queue] = set()
        self._message_queue = asyncio.Queue()
        self._task: Optional[asyncio.Task] = None

    async def start(self):
        """Start the message handler"""
        self._task = asyncio.create_task(self._process_messages())

    async def stop(self):
        """Stop the message handler"""
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

    def add_connection(self, queue: asyncio.Queue):
        """Add a new WebSocket connection"""
        self.connections.add(queue)

    def remove_connection(self, queue: asyncio.Queue):
        """Remove a WebSocket connection"""
        self.connections.discard(queue)

    async def broadcast_message(self, message: Dict[str, Any]):
        """Add message to queue for broadcasting"""
        await self._message_queue.put(message)

    async def _process_messages(self):
        """Process and broadcast messages to all connections"""
        while True:
            try:
                message = await self._message_queue.get()
                if not message:
                    continue

                # Add timestamp if not present
                if 'timestamp' not in message:
                    message['timestamp'] = datetime.utcnow().isoformat()

                # Serialize UUIDs
                message = self._serialize_uuids(message)

                # Broadcast to all connections
                message_str = json.dumps(message)
                for queue in self.connections:
                    try:
                        await queue.put(message_str)
                    except Exception as e:
                        print(f"Error sending message to connection: {e}")
                        self.remove_connection(queue)

            except Exception as e:
                print(f"Error processing message: {e}")
                continue

    def _serialize_uuids(self, obj: Any) -> Any:
        """Recursively serialize UUIDs to strings"""
        if isinstance(obj, dict):
            return {k: self._serialize_uuids(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._serialize_uuids(v) for v in obj]
        elif isinstance(obj, UUID):
            return str(obj)
        return obj

# Global message handler instance
message_handler = MessageHandler()