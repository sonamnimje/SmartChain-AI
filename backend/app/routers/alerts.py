from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from typing import List
from .realtime import manager as realtime_manager
import json

router = APIRouter(prefix="/alerts", tags=["alerts"])

# In-memory alerts store for demo
ALERTS = [
    {"id": 1, "message": "Low stock on Product X", "read": False},
    {"id": 2, "message": "Order #123 delayed", "read": False},
]

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

# Helper function to broadcast inventory/alert updates
async def broadcast_inventory_update(product, new_stock):
    await manager.broadcast({
        "type": "inventory_update",
        "product": product,
        "new_stock": new_stock
    })

@router.get("", response_model=List[dict])
def get_alerts():
    return ALERTS

@router.post("/read/{alert_id}")
def mark_alert_read(alert_id: int):
    for alert in ALERTS:
        if alert["id"] == alert_id:
            alert["read"] = True
            return {"detail": "Alert marked as read"}
    raise HTTPException(status_code=404, detail="Alert not found")

@router.post("/clear")
def clear_alerts():
    ALERTS.clear()
    return {"detail": "All alerts cleared"}

@router.post("/add")
def add_alert(alert: dict):
    new_id = max([a["id"] for a in ALERTS], default=0) + 1
    new_alert = {"id": new_id, "message": alert["message"], "read": False}
    ALERTS.append(new_alert)
    # Push to all websocket clients
    import asyncio
    asyncio.create_task(realtime_manager.broadcast(json.dumps({
        "type": "alert",
        "data": {
            "id": new_id,
            "message": alert["message"]
        }
    })))
    return new_alert

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # Keep the connection alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Add a new WebSocket endpoint for notifications
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi import Request
from fastapi.responses import HTMLResponse

@router.websocket("/ws/notifications")
async def websocket_notifications(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket) 