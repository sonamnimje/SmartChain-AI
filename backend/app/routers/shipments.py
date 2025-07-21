from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Shipment
from .. import schemas
from datetime import datetime
import uuid
from .realtime import manager as realtime_manager
import json
import asyncio

router = APIRouter(prefix="/shipments", tags=["shipments"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("", response_model=list[schemas.ShipmentRead])
def list_shipments(db: Session = Depends(get_db)):
    return db.query(Shipment).all()

@router.get("/{shipment_id}", response_model=schemas.ShipmentRead)
def get_shipment(shipment_id: int, db: Session = Depends(get_db)):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return shipment

@router.post("", response_model=schemas.ShipmentRead)
def create_shipment(shipment: schemas.ShipmentCreate, db: Session = Depends(get_db)):
    shipment_data = shipment.dict()
    if not shipment_data.get("tracking_number"):
        shipment_data["tracking_number"] = f"TRK-{uuid.uuid4().hex[:10].upper()}"
    db_shipment = Shipment(**shipment_data)
    db.add(db_shipment)
    db.commit()
    db.refresh(db_shipment)
    return db_shipment

@router.put("/{shipment_id}", response_model=schemas.ShipmentRead)
def update_shipment(shipment_id: int, shipment: schemas.ShipmentCreate, db: Session = Depends(get_db)):
    db_shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not db_shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    for key, value in shipment.dict().items():
        setattr(db_shipment, key, value)
    db.commit()
    db.refresh(db_shipment)
    # Broadcast shipment update
    asyncio.create_task(realtime_manager.broadcast(json.dumps({
        "type": "shipment_update",
        "data": {
            "shipment_id": db_shipment.id,
            "order_id": db_shipment.order_id,
            "status": db_shipment.status
        }
    })))
    return db_shipment

@router.delete("/{shipment_id}")
def delete_shipment(shipment_id: int, db: Session = Depends(get_db)):
    db_shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not db_shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    db.delete(db_shipment)
    db.commit()
    return {"detail": "Shipment deleted"} 