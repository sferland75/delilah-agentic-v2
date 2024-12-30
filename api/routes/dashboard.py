from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, Any, Optional, List
import logging
from datetime import datetime

from backend.metrics.dashboard_metrics import DashboardMetrics, MetricUpdate
from backend.auth import get_current_user
from models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

# Global metrics instance
metrics = DashboardMetrics()

class DashboardConnection:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to websocket: {str(e)}")

# Global connection manager
dashboard_connection = DashboardConnection()

@router.get("/metrics")
async def get_dashboard_metrics(
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get current dashboard metrics"""
    return {
        "metrics": metrics.get_current_metrics(),
        "trends": metrics.get_trend_data(),
        "insights": metrics.get_insights(),
        "timestamp": datetime.utcnow().isoformat()
    }

@router.websocket("/ws")
async def dashboard_websocket(websocket: WebSocket):
    """WebSocket connection for real-time dashboard updates"""
    await dashboard_connection.connect(websocket)
    
    try:
        # Send initial data
        initial_data = {
            "type": "initial_data",
            "metrics": metrics.get_current_metrics(),
            "trends": metrics.get_trend_data(),
            "insights": metrics.get_insights()
        }
        await websocket.send_json(initial_data)
        
        # Subscribe to metric updates
        async def metric_callback(message: dict):
            await websocket.send_json({
                "type": "metric_update",
                "data": message
            })
            
        metrics.subscribe(metric_callback)
        
        try:
            while True:
                # Keep connection alive and handle any client messages
                data = await websocket.receive_json()
                if data.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
        except WebSocketDisconnect:
            metrics.unsubscribe(metric_callback)
            dashboard_connection.disconnect(websocket)
            
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        dashboard_connection.disconnect(websocket)

@router.post("/metrics/{metric_type}")
async def update_metric(
    metric_type: str,
    value: Any,
    metadata: Optional[Dict[str, Any]] = None,
    current_user: User = Depends(get_current_user)
) -> Dict[str, str]:
    """Update a specific metric"""
    update = MetricUpdate(
        metric_type=metric_type,
        value=value,
        metadata=metadata
    )
    
    await metrics.update_metric(update)
    return {"status": "success"}