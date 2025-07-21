from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Inventory, Product, Warehouse, WarehouseLog
from .. import schemas
from datetime import datetime
import logging
from .alerts import manager as alerts_manager, broadcast_inventory_update
import asyncio
from .realtime import manager as realtime_manager
import json

router = APIRouter(prefix="/inventory", tags=["inventory"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("", response_model=list[schemas.InventoryRead])
def list_inventory(db: Session = Depends(get_db), name: str = None, category: str = None, location: str = None, status: str = None):
    query = db.query(Inventory)
    if name:
        query = query.filter(Inventory.name.ilike(f"%{name}%"))
    if category:
        query = query.filter(Inventory.category == category)
    if location:
        query = query.filter(Inventory.location == location)
    if status:
        query = query.filter(Inventory.status == status)
    return query.all()

@router.post("/add", response_model=schemas.InventoryRead)
async def add_product(item: schemas.InventoryCreate, db: Session = Depends(get_db)):
    data = item.dict()
    data['last_updated'] = datetime.utcnow()
    warehouse_id = data.get('warehouse_id')
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first() if warehouse_id else None
    if warehouse:
        data['location'] = warehouse.name
    # Check if inventory item already exists for this product+warehouse
    existing_item = db.query(Inventory).filter(Inventory.name == data['name'], Inventory.warehouse_id == warehouse_id).first()
    if existing_item:
        # Increase stock
        existing_item.stock += data['stock']
        existing_item.last_updated = datetime.utcnow()
        db_item = existing_item
    else:
        new_item = Inventory(**data)
        db.add(new_item)
        db_item = new_item
    # --- Product sync logic ---
    product = db.query(Product).filter(Product.name == data['name'], Product.warehouse_id == warehouse_id).first()
    if product:
        product.quantity += data['stock'] if existing_item else data['stock']
        product.category = data.get('category')
        if warehouse_id:
            product.warehouse_id = warehouse_id
        logging.info(f"Updated Product: {product.name}, quantity={product.quantity}, category={product.category}, warehouse_id={product.warehouse_id}")
    else:
        product = Product(name=data['name'], category=data.get('category'), quantity=data['stock'], warehouse_id=warehouse_id)
        db.add(product)
        logging.info(f"Created Product: {product.name}, quantity={product.quantity}, category={product.category}, warehouse_id={product.warehouse_id}")
    # --- End Product sync logic ---
    db.commit()
    db.refresh(db_item)
    # Broadcast inventory update
    asyncio.create_task(realtime_manager.broadcast(json.dumps({
        "type": "inventory_update",
        "data": {
            "product": db_item.name,
            "new_stock": db_item.stock
        }
    })))
    # Update items_stored in the corresponding warehouse, last_sync, and add log
    if warehouse:
        warehouse.items_stored = db.query(Inventory).filter(Inventory.warehouse_id == warehouse.id).count()
        warehouse.last_sync = datetime.utcnow()
        if not warehouse.stock_capacity or warehouse.stock_capacity == 0:
            warehouse.stock_capacity = 1000  # Default value, adjust as needed
        log = WarehouseLog(
            warehouse_id=warehouse.id,
            event_type="inventory_add",
            details=f"Added inventory item: {data['name']}, stock: {data['stock']}",
            timestamp=datetime.utcnow()
        )
        db.add(log)
        db.commit()
    # Print all products for debug
    all_products = db.query(Product).all()
    logging.info(f"All Products after add: {[{'name': p.name, 'quantity': p.quantity, 'warehouse_id': p.warehouse_id} for p in all_products]}")
    return db_item

@router.put("/edit/{item_id}", response_model=schemas.InventoryRead)
async def edit_product(item_id: int, item: schemas.InventoryCreate, db: Session = Depends(get_db)):
    db_item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    for key, value in item.dict().items():
        setattr(db_item, key, value)
    db_item.last_updated = datetime.utcnow()
    warehouse_id = item.warehouse_id
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first() if warehouse_id else None
    if warehouse:
        db_item.location = warehouse.name
    # --- Product sync logic ---
    product = None
    if warehouse_id:
        product = db.query(Product).filter(Product.name == db_item.name, Product.warehouse_id == warehouse_id).first()
    else:
        product = db.query(Product).filter(Product.name == db_item.name, Product.warehouse_id == None).first()
    if product:
        product.quantity = db_item.stock
        product.category = db_item.category
        if warehouse_id:
            product.warehouse_id = warehouse_id
        logging.info(f"Updated Product: {product.name}, quantity={product.quantity}, category={product.category}, warehouse_id={product.warehouse_id}")
    else:
        product = Product(name=db_item.name, category=db_item.category, quantity=db_item.stock, warehouse_id=warehouse_id)
        db.add(product)
        logging.info(f"Created Product: {product.name}, quantity={product.quantity}, category={product.category}, warehouse_id={product.warehouse_id}")
    # --- End Product sync logic ---
    db.commit()
    db.refresh(db_item)
    # Broadcast inventory update
    asyncio.create_task(realtime_manager.broadcast(json.dumps({
        "type": "inventory_update",
        "data": {
            "product": db_item.name,
            "new_stock": db_item.stock
        }
    })))
    # Update warehouse last_sync and add log
    if warehouse:
        warehouse.items_stored = db.query(Inventory).filter(Inventory.warehouse_id == warehouse.id).count()
        warehouse.last_sync = datetime.utcnow()
        if not warehouse.stock_capacity or warehouse.stock_capacity == 0:
            warehouse.stock_capacity = 1000  # Default value, adjust as needed
        log = WarehouseLog(
            warehouse_id=warehouse.id,
            event_type="inventory_edit",
            details=f"Edited inventory item: {db_item.name}, stock: {db_item.stock}",
            timestamp=datetime.utcnow()
        )
        db.add(log)
        db.commit()
    # Print all products for debug
    all_products = db.query(Product).all()
    logging.info(f"All Products after edit: {[{'name': p.name, 'quantity': p.quantity, 'warehouse_id': p.warehouse_id} for p in all_products]}")
    return db_item

@router.delete("/delete/{item_id}")
def delete_product(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    warehouse_name = db_item.location
    # Also delete the corresponding Product if it exists
    product = db.query(Product).filter(Product.name == db_item.name, Product.warehouse_id == db_item.warehouse_id).first()
    if product:
        db.delete(product)
    db.delete(db_item)
    db.commit()
    # Update items_stored in the corresponding warehouse
    if warehouse_name:
        warehouse = db.query(Warehouse).filter(Warehouse.name == warehouse_name).first()
        if warehouse:
            warehouse.items_stored = db.query(Inventory).filter(Inventory.location == warehouse.name).count()
            db.commit()
    return {"detail": "Item deleted"}

@router.post("/batch-upload")
def batch_upload():
    return {"message": "Batch upload endpoint (to be implemented)"}

@router.get("/alerts")
def inventory_alerts():
    return [{"type": "low_stock", "product": "Sample Product", "level": 5}] 