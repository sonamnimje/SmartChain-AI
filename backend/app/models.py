from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    role = Column(String, default="user")
    name = Column(String, nullable=False, default="")
    phone = Column(String, nullable=False, default="")
    avatar = Column(String, nullable=False, default="")  # base64-encoded image
    username = Column(String, unique=True, index=True, nullable=False, default="")
    location = Column(String, nullable=False, default="")

class Inventory(Base):
    __tablename__ = "inventory"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sku = Column(String, unique=True, index=True, nullable=True)  # Added SKU field
    stock = Column(Integer, nullable=False)
    category = Column(String, nullable=True)
    location = Column(String, nullable=True)
    reorder_threshold = Column(Integer, nullable=True)
    expiry_date = Column(String, nullable=True)
    last_updated = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    warehouse_id = Column(Integer)

class Warehouse(Base):
    __tablename__ = "warehouses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=True)
    status = Column(String, default="active")
    stock_capacity = Column(Integer, default=0)
    items_stored = Column(Integer, default=0)
    last_sync = Column(DateTime, default=datetime.utcnow)

class WarehouseLog(Base):
    __tablename__ = "warehouse_logs"
    id = Column(Integer, primary_key=True, index=True)
    warehouse_id = Column(Integer)
    event_type = Column(String)
    details = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Staff(Base):
    __tablename__ = "staff"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    shift_time = Column(String, nullable=True)
    contact_info = Column(String, nullable=True)
    assigned_warehouse_id = Column(Integer)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    quantity = Column(Integer, default=0)
    warehouse_id = Column(Integer)
    expiry_date = Column(DateTime, nullable=True)

class Transfer(Base):
    __tablename__ = "transfers"
    id = Column(Integer, primary_key=True, index=True)
    source_warehouse_id = Column(Integer)
    dest_warehouse_id = Column(Integer)
    product_id = Column(Integer)
    quantity = Column(Integer, default=0)
    status = Column(String, default="pending")
    ai_suggestion = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=False)
    product = Column(String, nullable=False)
    quantity = Column(Integer, default=1)
    status = Column(String, default="pending")
    address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Delivery(Base):
    __tablename__ = "deliveries"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, nullable=True)  # Link to orders
    recipient = Column(String, nullable=False)
    address = Column(String, nullable=False)
    status = Column(String, default="pending")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    items = Column(String, nullable=True)
    dispatch_date = Column(String, nullable=True)
    expected_delivery = Column(String, nullable=True)
    tracking_id = Column(String, nullable=True)
    notes = Column(String, nullable=True)

class SystemConfig(Base):
    __tablename__ = "system_config"
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, nullable=True)
    address = Column(String, nullable=True)
    notifications_enabled = Column(Boolean, default=True)
    default_reorder_threshold = Column(Integer, nullable=True)
    default_pricing_markup = Column(Float, nullable=True)
    low_stock_alert_level = Column(Integer, nullable=True)
    expiry_alert_days = Column(Integer, nullable=True)
    custom_alert_rules = Column(String, nullable=True)

class IntegrationConfig(Base):
    __tablename__ = "integration_config"
    id = Column(Integer, primary_key=True, index=True)

class Vendor(Base):
    __tablename__ = "vendors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    company = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True) 

class ProductPriceHistory(Base):
    __tablename__ = "product_price_history"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer)
    vendor_id = Column(Integer)
    price = Column(Float)
    date = Column(DateTime, default=datetime.utcnow)

class VendorProduct(Base):
    __tablename__ = "vendor_product"
    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer)
    product_id = Column(Integer)
    price = Column(Float)
    reliability_score = Column(Float, nullable=True)

class VendorProof(Base):
    __tablename__ = "vendor_proofs"
    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, nullable=False)
    order_id = Column(Integer, nullable=False)
    proof_file = Column(String, nullable=True)  # File path or base64 data
    proof_status = Column(String, default="pending")  # pending, approved, rejected
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)
    reviewed_by = Column(String, nullable=True)
    comments = Column(String, nullable=True) 

class Shipment(Base):
    __tablename__ = "shipments"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, nullable=True)  # Link to orders
    delivery_id = Column(Integer, nullable=True)  # Link to deliveries
    status = Column(String, default="pending")
    tracking_number = Column(String, nullable=True)
    carrier = Column(String, nullable=True)
    shipped_date = Column(DateTime, nullable=True)
    expected_delivery_date = Column(DateTime, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow) 

class Return(Base):
    __tablename__ = "returns"
    id = Column(String, primary_key=True, index=True)
    date = Column(String, nullable=False)
    customer = Column(String, nullable=False)
    status = Column(String, nullable=False) 