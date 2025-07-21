from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Return
from ..schemas import ReturnCreate, ReturnRead
from .realtime import manager as realtime_manager
import json

router = APIRouter(prefix="/returns", tags=["returns"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("", response_model=list[ReturnRead])
def list_returns(db: Session = Depends(get_db)):
    return db.query(Return).all()

@router.post("", response_model=ReturnRead)
async def create_return(item: ReturnCreate, db: Session = Depends(get_db)):
    db_item = Return(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    # Broadcast to WebSocket clients
    await realtime_manager.broadcast(json.dumps({
        "type": "return_update",
        "data": {
            "id": db_item.id,
            "date": db_item.date,
            "customer": db_item.customer,
            "status": db_item.status
        }
    }))
    return db_item

@router.delete("/{return_id}")
async def delete_return(return_id: str, db: Session = Depends(get_db)):
    db_item = db.query(Return).filter(Return.id == return_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Return not found")
    db.delete(db_item)
    db.commit()
    # Broadcast delete
    await realtime_manager.broadcast(json.dumps({
        "type": "return_delete",
        "data": {"id": return_id}
    }))
    return {"detail": "Return deleted"} 