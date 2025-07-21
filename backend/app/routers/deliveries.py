from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Delivery, Order
from .. import schemas
from datetime import datetime, timedelta
from sqlalchemy import func, text

router = APIRouter(prefix="/deliveries", tags=["deliveries"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("", response_model=list[schemas.DeliveryWithOrder])
def list_deliveries(db: Session = Depends(get_db)):
    deliveries = db.query(Delivery).all()
    result = []
    for d in deliveries:
        order = db.query(Order).filter(Order.id == d.order_id).first() if d.order_id else None
        vendor_proof = None
        if order:
            vendor_proof = db.execute(
                text("""
                SELECT * FROM vendor_proofs WHERE order_id = :order_id
                """), {"order_id": order.id}
            ).fetchone()
            if vendor_proof:
                # Convert to dict for Pydantic
                vendor_proof = dict(vendor_proof._mapping)
        result.append({
            **d.__dict__,
            "order": order,
            "vendor_proof": vendor_proof
        })
    return result

@router.post("/add", response_model=schemas.DeliveryRead)
def add_delivery(delivery: schemas.DeliveryCreate, db: Session = Depends(get_db)):
    # Validation: order_id must be provided and valid
    if not delivery.order_id:
        raise HTTPException(status_code=400, detail="order_id must be provided when creating a delivery.")
    order = db.query(Order).filter(Order.id == delivery.order_id).first()
    if not order:
        raise HTTPException(status_code=400, detail=f"No order found with id {delivery.order_id}.")
    db_delivery = Delivery(
        order_id=delivery.order_id,
        recipient=delivery.recipient,
        address=delivery.address,
        status=delivery.status,
        latitude=delivery.latitude,
        longitude=delivery.longitude
    )
    db.add(db_delivery)
    db.commit()
    db.refresh(db_delivery)
    return db_delivery

@router.put("/edit/{delivery_id}", response_model=schemas.DeliveryRead)
def edit_delivery(delivery_id: int, delivery: schemas.DeliveryCreate, db: Session = Depends(get_db)):
    db_delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not db_delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    db_delivery.order_id = delivery.order_id
    db_delivery.recipient = delivery.recipient
    db_delivery.address = delivery.address
    db_delivery.status = delivery.status
    db_delivery.latitude = delivery.latitude
    db_delivery.longitude = delivery.longitude
    db.commit()
    db.refresh(db_delivery)
    return db_delivery

@router.delete("/delete/{item_id}")
def delete_delivery(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(Delivery).filter(Delivery.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Delivery not found")
    db.delete(db_item)
    db.commit()
    return {"detail": "Delivery deleted"}

@router.get("/drivers")
def list_drivers():
    return [{"id": 1, "name": "Driver A"}]

@router.get("/route-optimization")
def route_optimization():
    return {"message": "Route optimization endpoint (to be implemented)"}

@router.get("/analytics")
def delivery_analytics():
    return {"message": "Delivery analytics endpoint (to be implemented)"}

@router.get("/pending", response_model=list[schemas.DeliveryRead])
def get_pending_deliveries(db: Session = Depends(get_db)):
    return db.query(Delivery).filter(Delivery.status == "pending").all()

@router.post("/{delivery_id}/mark_delivered", response_model=schemas.DeliveryRead)
def mark_as_delivered(delivery_id: int, db: Session = Depends(get_db)):
    delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    delivery.status = "delivered"
    # Update related order status if exists
    if delivery.order_id:
        order = db.query(Order).filter(Order.id == delivery.order_id).first()
        if order:
            order.status = "delivered"
            db.add(order)
    db.commit()
    db.refresh(delivery)
    return delivery

@router.post("/{delivery_id}/mark_shipped", response_model=schemas.DeliveryRead)
def mark_as_shipped(delivery_id: int, db: Session = Depends(get_db)):
    delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    delivery.status = "shipped"
    # Update related order status if exists
    if delivery.order_id:
        order = db.query(Order).filter(Order.id == delivery.order_id).first()
        if order:
            order.status = "shipped"
            db.add(order)
    db.commit()
    db.refresh(delivery)

    # --- Create Shipment record ---
    from ..models import Shipment
    shipment = Shipment(
        order_id=delivery.order_id,
        delivery_id=delivery.id,
        status="shipped",
        shipped_date=datetime.utcnow(),
        notes=f"Auto-created when delivery {delivery.id} marked as shipped."
    )
    db.add(shipment)
    db.commit()
    # ----------------------------

    return delivery

@router.post("/{delivery_id}/mark_cancelled", response_model=schemas.DeliveryRead)
def mark_as_cancelled(delivery_id: int, db: Session = Depends(get_db)):
    delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    delivery.status = "cancelled"
    # Update related order status if exists
    if delivery.order_id:
        order = db.query(Order).filter(Order.id == delivery.order_id).first()
        if order:
            order.status = "cancelled"
            db.add(order)
    db.commit()
    db.refresh(delivery)
    return delivery

@router.post("/{delivery_id}/mark_returned", response_model=schemas.DeliveryRead)
def mark_as_returned(delivery_id: int, db: Session = Depends(get_db)):
    delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    delivery.status = "return"
    # Optionally update related order status if needed
    if delivery.order_id:
        order = db.query(Order).filter(Order.id == delivery.order_id).first()
        if order:
            order.status = "return"
            db.add(order)
    db.commit()
    db.refresh(delivery)
    return delivery

@router.get("/completed_stats")
def get_completed_stats(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day)
    week_start = today_start - timedelta(days=now.weekday())
    month_start = datetime(now.year, now.month, 1)
    today_count = db.query(func.count(Delivery.id)).filter(Delivery.status == "delivered", Delivery.created_at >= today_start).scalar()
    week_count = db.query(func.count(Delivery.id)).filter(Delivery.status == "delivered", Delivery.created_at >= week_start).scalar()
    month_count = db.query(func.count(Delivery.id)).filter(Delivery.status == "delivered", Delivery.created_at >= month_start).scalar()
    return {"today": today_count, "week": week_count, "month": month_count}

@router.get("/history", response_model=list[schemas.DeliveryRead])
def get_delivery_history(db: Session = Depends(get_db)):
    return db.query(Delivery).filter(Delivery.status == "delivered").order_by(Delivery.created_at.desc()).all()

@router.get("/pending_with_orders", response_model=list[schemas.DeliveryWithOrder])
def get_pending_deliveries_with_orders(db: Session = Depends(get_db)):
    deliveries = db.query(Delivery).filter(Delivery.status == "pending").all()
    result = []
    for d in deliveries:
        order = db.query(Order).filter(Order.id == d.order_id).first() if d.order_id else None
        result.append({
            **d.__dict__,
            "order": order
        })
    return result

@router.get("/history_with_orders", response_model=list[schemas.DeliveryWithOrder])
def get_delivery_history_with_orders(db: Session = Depends(get_db)):
    deliveries = db.query(Delivery).filter(Delivery.status == "delivered").order_by(Delivery.created_at.desc()).all()
    result = []
    for d in deliveries:
        order = db.query(Order).filter(Order.id == d.order_id).first() if d.order_id else None
        result.append({
            **d.__dict__,
            "order": order
        })
    return result 