from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
from .database import engine, SessionLocal, get_db
from . import models
from .models import User, Inventory, Order, Delivery
from fastapi import APIRouter
from typing import List
from pydantic import BaseModel
from sqlalchemy import func
from .models import Product
from apscheduler.schedulers.background import BackgroundScheduler
from .routers.reports import scheduled_send_monthly_report

from .routers import alerts, reports, vendor, product, shipments, realtime, returns

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "https://smartchain-ai-frontend.onrender.com",
        "https://smartchain-ai-frontend-imvu.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# (get_db function removed, now import from database)

@app.get("/")
def read_root():
    return {"message": "Welcome to SmartChain AI API", "status": "healthy"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/dashboard")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    total_inventory = db.query(Inventory).count()
    total_orders = db.query(Order).count()
    total_shipments = db.query(Delivery).count()
    return {
        "total_inventory": total_inventory,
        "total_orders": total_orders,
        "total_shipments": total_shipments
    }

@app.post("/seed-test-data")
def seed_test_data(db: Session = Depends(get_db)):
    # Add inventory items
    inventory_items = [
        Inventory(name="Pulses - Toor Dal", stock=120, category="Pulses"),
        Inventory(name="Rice - Basmati", stock=200, category="Rice"),
        Inventory(name="Wheat Flour", stock=150, category="Flour"),
    ]
    for item in inventory_items:
        db.add(item)
    db.commit()

    # Add products
    products = [
        Product(name="Pulses - Toor Dal", category="Pulses", quantity=120),
        Product(name="Rice - Basmati", category="Rice", quantity=200),
        Product(name="Wheat Flour", category="Flour", quantity=150),
        Product(name="Amul Milk", category="Dairy", quantity=100),
        Product(name="Biscuit", category="Snacks", quantity=100),
        Product(name="Maggie", category="Snacks", quantity=100),
        Product(name="Soap", category="Personal Care", quantity=100),
        Product(name="Body shower", category="Personal Care", quantity=100),
        # Add more as needed
    ]
    for product in products:
        db.add(product)
    db.commit()

    # Add orders
    orders = [
        Order(customer_name="Alice", product="Pulses - Toor Dal", quantity=2),
        Order(customer_name="Bob", product="Rice - Basmati", quantity=5),
        Order(customer_name="Charlie", product="Wheat Flour", quantity=3),
        Order(customer_name="Alice", product="Rice - Basmati", quantity=1),
    ]
    for order in orders:
        db.add(order)
    db.commit()

    # Add deliveries
    deliveries = [
        Delivery(order_id=1, recipient="Alice", address="123 Main St"),
        Delivery(order_id=2, recipient="Bob", address="456 Oak Ave"),
        Delivery(order_id=3, recipient="Charlie", address="789 Pine Rd"),
    ]
    for delivery in deliveries:
        db.add(delivery)
    db.commit()

    return {"message": "Test data seeded."}

# Routers (to be implemented)
from .routers import auth, inventory, orders, warehouses, deliveries, ai, reports, settings, alerts
app.include_router(auth.router)
app.include_router(inventory.router)
app.include_router(orders.router)
app.include_router(warehouses.router)
app.include_router(deliveries.router)
app.include_router(ai.router, prefix="/ai")
app.include_router(reports.router)
app.include_router(settings.router)
app.include_router(alerts.router)
app.include_router(vendor.router)
app.include_router(product.router)
app.include_router(shipments.router)
app.include_router(realtime.router)
app.include_router(returns.router)

router = APIRouter()

class Report(BaseModel):
    name: str
    date: str
    action: str

@router.get("/api/reports", response_model=List[Report])
def get_reports():
    # Replace this with real DB queries as needed
    return [
        {"name": "Monthly Sales", "date": "2024-06-01", "action": "View"},
        {"name": "Inventory Audit", "date": "2024-05-28", "action": "Download"},
        {"name": "Returns Summary", "date": "2024-05-20", "action": "View"},
    ]

class SalesData(BaseModel):
    name: str
    sales: int

@router.get("/api/sales", response_model=List[SalesData])
def get_sales(db: Session = Depends(get_db)):
    # Use "%Y-%m" for year-month (works in SQLite)
    sales = (
        db.query(
            func.strftime("%Y-%m", Order.created_at).label("month"),
            func.sum(Order.quantity).label("sales")
        )
        .group_by("month")
        .order_by("month")
        .all()
    )
    return [
        {"name": month or "", "sales": int(sales_amt or 0)}
        for month, sales_amt in sales
    ]

scheduler = BackgroundScheduler()
# Run at 23:59 on the last day of each month
scheduler.add_job(scheduled_send_monthly_report, 'cron', day='last', hour=23, minute=59)
scheduler.start()

@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()

models.Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    from .database import SessionLocal
    db = SessionLocal()
    # Clear Product table
    db.query(Product).delete()
    db.commit()
    print("Product table cleared.")
    # Add all products directly
    products = [
        Product(name="Pulses - Toor Dal", category="Pulses", quantity=120),
        Product(name="Rice - Basmati", category="Rice", quantity=200),
        Product(name="Wheat Flour", category="Flour", quantity=150),
        Product(name="Amul Milk", category="Dairy", quantity=100),
        Product(name="Biscuit", category="Snacks", quantity=100),
        Product(name="Maggie", category="Snacks", quantity=100),
        Product(name="Soap", category="Personal Care", quantity=100),
        Product(name="Body shower", category="Personal Care", quantity=100),
        # Add more as needed
    ]
    for product in products:
        db.add(product)
    db.commit()
    print("All products added to Product table.")
    # Optionally, clear Inventory and Order tables if you want a full reset:
    # db.query(Inventory).delete()
    # db.query(Order).delete()
    # db.commit()
    print("You can now restart the backend and place orders for all products.") 