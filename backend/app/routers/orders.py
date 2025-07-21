from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Order, Product, Delivery
from ..schemas import OrderCreate, OrderRead, DeliveryCreate, DeliveryRead
from datetime import datetime, timedelta
import logging
import uuid
from .alerts import manager as alerts_manager  # Import the ConnectionManager for WebSocket
from .realtime import manager as realtime_manager
import json

router = APIRouter(prefix="/orders", tags=["orders"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("", response_model=list[OrderRead])
def list_orders(status: str = Query(None), db: Session = Depends(get_db)):
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)
    return query.all()

@router.post("/add", response_model=OrderRead)
@router.post("/add/", response_model=OrderRead)
def add_order(item: OrderCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Find the product by name
    product = db.query(Product).filter(Product.name == item.product).first()
    logging.info(f"Order attempt: product={item.product}, quantity={item.quantity}")
    if not product:
        logging.error(f"Product not found: {item.product}")
        raise HTTPException(status_code=404, detail="Product not found")
    # Check stock
    if item.quantity > product.quantity:
        logging.error(f"Insufficient stock for {item.product}: requested={item.quantity}, available={product.quantity}")
        raise HTTPException(status_code=400, detail=f"Only {product.quantity} units left in stock!")
    # Reduce stock
    product.quantity -= item.quantity
    db.add(product)
    # --- Update Inventory stock as well ---
    from ..models import Inventory
    inventory_item = db.query(Inventory).filter(Inventory.name == item.product).first()
    if inventory_item:
        inventory_item.stock = product.quantity
        db.add(inventory_item)
    # Create order
    new_item = Order(**item.dict())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    logging.info(f"Order placed: {new_item.product}, quantity={new_item.quantity}, remaining_stock={product.quantity}")

    # --- Broadcast inventory update to WebSocket clients ---
    from fastapi.concurrency import run_in_threadpool
    background_tasks.add_task(
        run_in_threadpool,
        realtime_manager.broadcast,
        json.dumps({
            "type": "inventory_update",
            "data": {
                "product": item.product,
                "new_stock": product.quantity
            }
        })
    )
    # --- Broadcast order update ---
    background_tasks.add_task(
        run_in_threadpool,
        realtime_manager.broadcast,
        json.dumps({
            "type": "order_update",
            "data": {
                "order_id": new_item.id,
                "product": new_item.product,
                "quantity": new_item.quantity,
                "customer": new_item.customer_name,
                "status": new_item.status
            }
        })
    )
    # --- Create linked delivery ---
    db_delivery = Delivery(
        order_id=new_item.id,
        recipient=new_item.customer_name,
        address=new_item.address,  # Use address from order
        status="pending"
    )
    db.add(db_delivery)
    db.commit()
    db.refresh(db_delivery)
    # -----------------------------

    # --- Create linked shipment ---
    from ..models import Shipment
    tracking_number = f"TRK-{uuid.uuid4().hex[:10].upper()}"
    shipped_date = datetime.utcnow()
    expected_delivery_date = shipped_date + timedelta(days=3)
    db_shipment = Shipment(
        order_id=new_item.id,
        delivery_id=db_delivery.id,
        status="pending",
        tracking_number=tracking_number,
        carrier="SmartChain Logistics",
        shipped_date=shipped_date,
        expected_delivery_date=expected_delivery_date,
        notes="Auto-created when order placed"
    )
    db.add(db_shipment)
    db.commit()
    db.refresh(db_shipment)
    # ------------------------------

    # --- Broadcast shipment creation ---
    background_tasks.add_task(
        run_in_threadpool,
        realtime_manager.broadcast,
        json.dumps({
            "type": "shipment_update",
            "data": {
                "shipment_id": db_shipment.id,
                "order_id": db_shipment.order_id,
                "status": db_shipment.status,
                "tracking_number": db_shipment.tracking_number,
                "carrier": db_shipment.carrier,
                "expected_delivery_date": db_shipment.expected_delivery_date.isoformat() if db_shipment.expected_delivery_date else None
            }
        })
    )

    return new_item

@router.put("/edit/{item_id}", response_model=OrderRead)
def edit_order(item_id: int, item: OrderCreate, db: Session = Depends(get_db)):
    db_item = db.query(Order).filter(Order.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Order not found")
    for key, value in item.dict().items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/delete/{item_id}")
def delete_order(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(Order).filter(Order.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(db_item)
    db.commit()
    return {"detail": "Order deleted"}

@router.get("/analytics")
def order_analytics(
    db: Session = Depends(get_db),
    range_value: str = Query('month', description="Range for sales trends: year, 6months, 3months, week, month (default)")
):
    # Determine date range
    today = datetime.utcnow().date()
    if range_value == 'year':
        days = 365
    elif range_value == '6months':
        days = 182
    elif range_value == '3months':
        days = 91
    elif range_value == 'week':
        days = 7
    else:
        days = 30
    start_date = today - timedelta(days=days-1)
    # Filter orders by created_at
    orders = db.query(Order).filter(Order.created_at >= start_date).all()
    # Total orders in range
    total_orders = len(orders)
    # Orders per product
    orders_per_product = {}
    for order in orders:
        orders_per_product[order.product] = orders_per_product.get(order.product, 0) + order.quantity
    # Orders per day (for charting)
    orders_per_day = {}
    for i in range(days-1, -1, -1):
        day = today - timedelta(days=i)
        orders_per_day[str(day)] = 0
    for order in orders:
        order_day = str(order.created_at.date())
        if order_day in orders_per_day:
            orders_per_day[order_day] += 1
    return {
        "total_orders": total_orders,
        "orders_per_product": orders_per_product,
        "orders_per_day": orders_per_day
    } 