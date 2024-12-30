from typing import List, Optional
from uuid import UUID, uuid4
from datetime import datetime

from api.models.client import Client, ClientCreate, ClientUpdate

class ClientManager:
    def __init__(self):
        self.clients = {}

    async def create_client(self, client_data: ClientCreate) -> Client:
        """Create a new client"""
        client_id = uuid4()
        now = datetime.utcnow()
        
        client = Client(
            id=client_id,
            created_at=now,
            updated_at=now,
            **client_data.model_dump()
        )
        
        self.clients[client_id] = client
        return client

    async def get_client(self, client_id: UUID) -> Optional[Client]:
        """Get a client by ID"""
        return self.clients.get(client_id)

    async def list_clients(
        self,
        skip: int = 0,
        limit: int = 10,
        search: Optional[str] = None
    ) -> List[Client]:
        """List clients with optional search"""
        clients = list(self.clients.values())
        
        if search:
            search = search.lower()
            clients = [
                c for c in clients
                if search in c.first_name.lower() or
                   search in c.last_name.lower() or
                   (c.email and search in c.email.lower())
            ]
        
        return clients[skip:skip + limit]

    async def update_client(self, client_id: UUID, client_update: ClientUpdate) -> Optional[Client]:
        """Update a client's information"""
        if client_id not in self.clients:
            return None
            
        client = self.clients[client_id]
        update_data = client_update.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(client, field, value)
            
        client.updated_at = datetime.utcnow()
        return client

    async def delete_client(self, client_id: UUID) -> None:
        """Soft delete a client"""
        if client_id not in self.clients:
            raise ValueError("Client not found")
            
        client = self.clients[client_id]
        client.is_active = False
        client.updated_at = datetime.utcnow()