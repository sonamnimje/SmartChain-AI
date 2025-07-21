from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Warehouse, Product, WarehouseLog, Transfer, Staff
from .. import schemas
from .auth import get_current_user
from datetime import datetime, timedelta
from fastapi.responses import StreamingResponse
import csv
from io import StringIO
from sqlalchemy import func

router = APIRouter(prefix="/warehouses", tags=["warehouses"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("", response_model=list[schemas.WarehouseRead])
def list_warehouses(db: Session = Depends(get_db), current_user=Depends(get_current_user), status: str = None):
    from ..models import Inventory, Product
    warehouses = []
    if current_user.role == "admin":
        query = db.query(Warehouse)
        if status:
            query = query.filter(Warehouse.status == status)
        warehouses = query.all()
    elif current_user.role == "manager":
        query = db.query(Warehouse).filter(Warehouse.location == current_user.location)
        if status:
            query = query.filter(Warehouse.status == status)
        warehouses = query.all()
    else:
        raise HTTPException(status_code=403, detail="Not authorized to view warehouses")
    # Attach items_stored dynamically using warehouse_id (total quantity, not just count)
    for wh in warehouses:
        total_quantity = db.query(func.sum(Product.quantity)).filter(Product.warehouse_id == wh.id).scalar() or 0
        wh.items_stored = total_quantity
    return warehouses

@router.post("/add", response_model=schemas.WarehouseRead)
def add_warehouse(item: schemas.WarehouseCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can add warehouses")
    new_item = Warehouse(**item.dict())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.put("/edit/{item_id}", response_model=schemas.WarehouseRead)
def edit_warehouse(item_id: int, item: schemas.WarehouseCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can edit warehouses")
    db_item = db.query(Warehouse).filter(Warehouse.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    for key, value in item.dict().items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/delete/{item_id}")
def delete_warehouse(item_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete warehouses")
    db_item = db.query(Warehouse).filter(Warehouse.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    db.delete(db_item)
    db.commit()
    return {"detail": "Warehouse deleted"}

@router.get("/smart-placement")
def smart_placement():
    # Mock AI layout suggestions for demonstration
    suggestions = [
        "Place Rice near the entrance for faster picking.",
        "Store Wheat in the central aisle to balance load.",
        "Move Sugar to the back to optimize space usage.",
        "Reserve Zone A for high-turnover items.",
        "Group similar SKUs together for efficiency."
    ]
    return {"suggestions": suggestions}

@router.get("/{warehouse_id}/status")
def warehouse_status(warehouse_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    # Role-based access
    if current_user.role != "admin" and (current_user.role != "manager" or warehouse.location != current_user.location):
        raise HTTPException(status_code=403, detail="Not authorized")
    # Simulate IoT status (online if last_sync < 10 min ago)
    now = datetime.utcnow()
    online = (now - warehouse.last_sync) < timedelta(minutes=10)
    return {
        "warehouse_id": warehouse.id,
        "name": warehouse.name,
        "status": warehouse.status,
        "last_sync": warehouse.last_sync,
        "online": online
    }

@router.get("/{warehouse_id}/stock-summary")
def warehouse_stock_summary(warehouse_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from ..models import Inventory
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    if current_user.role != "admin" and (current_user.role != "manager" or warehouse.location != current_user.location):
        raise HTTPException(status_code=403, detail="Not authorized")
    products = db.query(Product).filter(Product.warehouse_id == warehouse_id).all()
    total_quantity = sum([p.quantity for p in products])
    top_products = sorted(products, key=lambda p: p.quantity, reverse=True)[:10]
    low_stock = [p for p in products if p.quantity < 10]
    overstock = [p for p in products if p.quantity > 0.9 * warehouse.stock_capacity]
    # Use total quantity for items_stored
    items_stored = total_quantity
    return {
        "warehouse_id": warehouse.id,
        "stock_capacity": warehouse.stock_capacity,
        "items_stored": items_stored,
        "stock_usage_percent": (total_quantity / warehouse.stock_capacity * 100) if warehouse.stock_capacity else 0,
        "top_products": [{"id": p.id, "name": p.name, "quantity": p.quantity} for p in top_products],
        "low_stock": [{"id": p.id, "name": p.name, "quantity": p.quantity} for p in low_stock],
        "overstock": [{"id": p.id, "name": p.name, "quantity": p.quantity} for p in overstock]
    }

@router.get("/{warehouse_id}/alerts")
def warehouse_alerts(warehouse_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    if current_user.role != "admin" and (current_user.role != "manager" or warehouse.location != current_user.location):
        raise HTTPException(status_code=403, detail="Not authorized")
    alerts = []
    # Capacity alert
    if warehouse.items_stored >= warehouse.stock_capacity:
        alerts.append({"type": "capacity", "message": "Warehouse at full capacity"})
    # Sensor/IoT alert (simulate offline)
    now = datetime.utcnow()
    if (now - warehouse.last_sync) > timedelta(minutes=15):
        alerts.append({"type": "sensor", "message": "Warehouse sensors offline or sync delayed"})
    # Product expiry/reorder alerts
    products = db.query(Product).filter(Product.warehouse_id == warehouse_id).all()
    for p in products:
        if p.expiry_date and isinstance(p.expiry_date, datetime):
            if (p.expiry_date - now).days < 7:
                alerts.append({"type": "expiry", "message": f"Product {p.name} nearing expiry"})
        if p.quantity < 5:
            alerts.append({"type": "reorder", "message": f"Low stock for {p.name}, consider reorder"})
    return {"warehouse_id": warehouse.id, "alerts": alerts}

@router.post("/transfer", response_model=schemas.TransferRead)
def transfer_inventory(item: schemas.TransferCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Only admin or manager for source/dest warehouse
    allowed = current_user.role == "admin"
    if current_user.role == "manager":
        allowed = False
        # Manager can transfer if source or dest is their warehouse
        src = db.query(Warehouse).filter(Warehouse.id == item.source_warehouse_id).first()
        dest = db.query(Warehouse).filter(Warehouse.id == item.dest_warehouse_id).first()
        if (src and src.location == current_user.location) or (dest and dest.location == current_user.location):
            allowed = True
    if not allowed:
        raise HTTPException(status_code=403, detail="Not authorized to transfer inventory")
    transfer = Transfer(**item.dict())
    db.add(transfer)
    db.commit()
    db.refresh(transfer)
    return transfer

@router.get("/{warehouse_id}/staff", response_model=list[schemas.StaffRead])
def warehouse_staff(warehouse_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    if current_user.role != "admin" and (current_user.role != "manager" or warehouse.location != current_user.location):
        raise HTTPException(status_code=403, detail="Not authorized")
    staff = db.query(Staff).filter(Staff.assigned_warehouse_id == warehouse_id).all()
    return staff

@router.get("/{warehouse_id}/logs")
def warehouse_logs(warehouse_id: int, export: str = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    if current_user.role != "admin" and (current_user.role != "manager" or warehouse.location != current_user.location):
        raise HTTPException(status_code=403, detail="Not authorized")
    logs = db.query(WarehouseLog).filter(WarehouseLog.warehouse_id == warehouse_id).all()
    if export == "csv":
        si = StringIO()
        cw = csv.writer(si)
        cw.writerow(["id", "event_type", "details", "timestamp"])
        for log in logs:
            cw.writerow([log.id, log.event_type, log.details, log.timestamp])
        si.seek(0)
        return StreamingResponse(si, media_type="text/csv", headers={"Content-Disposition": f"attachment; filename=warehouse_{warehouse_id}_logs.csv"})
    return [{"id": l.id, "warehouse_id": l.warehouse_id, "event_type": l.event_type, "details": l.details, "timestamp": l.timestamp} for l in logs]

@router.get("/ai-suggestions")
def ai_suggestions(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    # Mock AI suggestions
    suggestions = [
        {"type": "transfer", "message": "Transfer 100 units of Rice from Pune to Mumbai due to low demand in Pune."},
        {"type": "stocking", "message": "Increase stocking of Wheat in Mumbai Central for upcoming festival demand."},
        {"type": "anomaly", "message": "Unexpected depletion of Sugar in Delhi warehouse detected."}
    ]
    return {"suggestions": suggestions}

@router.get("/with-inventory", response_model=list[schemas.WarehouseRead])
def warehouses_with_inventory(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Admin: all warehouses with inventory; Manager: only their location
    query = db.query(Warehouse).join(Product, Warehouse.id == Product.warehouse_id)
    if current_user.role == "admin":
        warehouses = query.group_by(Warehouse.id).all()
    elif current_user.role == "manager":
        warehouses = query.filter(Warehouse.location == current_user.location).group_by(Warehouse.id).all()
    else:
        raise HTTPException(status_code=403, detail="Not authorized to view warehouses")
    return warehouses 