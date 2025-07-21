from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None
    phone: str | None = None
    avatar: str | None = None  # base64-encoded image
    username: str | None = None
    location: str | None = None
    role: str = "user"  # Add role with default
    
    @classmethod
    def validate_role(cls, value):
        allowed_roles = {"admin", "staff", "supplier", "driver", "user"}
        if value not in allowed_roles:
            raise ValueError(f"Role must be one of {allowed_roles}")
        return value
    
    # Pydantic v1: use validator
    from pydantic import validator
    @validator("role")
    def check_role(cls, v):
        return cls.validate_role(v)

class UserRead(BaseModel):
    id: int
    email: EmailStr
    is_active: bool
    role: str
    name: str | None = None
    phone: str | None = None
    avatar: str | None = None  # base64-encoded image
    username: str | None = None
    location: str | None = None
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class InventoryBase(BaseModel):
    name: str
    stock: int
    category: str | None = None
    location: str | None = None
    reorder_threshold: int | None = None
    expiry_date: str | None = None
    warehouse_id: int | None = None

class InventoryCreate(InventoryBase):
    pass

class InventoryRead(InventoryBase):
    id: int
    last_updated: datetime | None = None
    created_at: datetime
    class Config:
        from_attributes = True

class WarehouseBase(BaseModel):
    name: str
    location: str | None = None
    status: str | None = "active"
    stock_capacity: int | None = 0
    items_stored: int | None = 0
    last_sync: datetime | None = None

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseRead(WarehouseBase):
    id: int
    class Config:
        from_attributes = True

class WarehouseLogBase(BaseModel):
    warehouse_id: int
    event_type: str
    details: str
    timestamp: datetime | None = None

class WarehouseLogCreate(WarehouseLogBase):
    pass

class WarehouseLogRead(WarehouseLogBase):
    id: int
    class Config:
        from_attributes = True

class StaffBase(BaseModel):
    name: str
    role: str
    shift_time: str | None = None
    contact_info: str | None = None
    assigned_warehouse_id: int | None = None

class StaffCreate(StaffBase):
    pass

class StaffRead(StaffBase):
    id: int
    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    category: str | None = None
    quantity: int | None = 0
    warehouse_id: int
    expiry_date: datetime | None = None

class ProductCreate(ProductBase):
    pass

class ProductRead(ProductBase):
    id: int
    class Config:
        from_attributes = True

class TransferBase(BaseModel):
    source_warehouse_id: int
    dest_warehouse_id: int
    product_id: int
    quantity: int | None = 0
    status: str | None = "pending"
    ai_suggestion: str | None = None
    timestamp: datetime | None = None

class TransferCreate(TransferBase):
    pass

class TransferRead(TransferBase):
    id: int
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    customer_name: str
    product: str
    quantity: int = 1
    status: str = "pending"
    address: str  # New field for delivery address

class OrderRead(BaseModel):
    id: int
    customer_name: str
    product: str
    quantity: int
    status: str
    address: str  # New field for delivery address
    created_at: datetime
    class Config:
        from_attributes = True

class DeliveryCreate(BaseModel):
    order_id: int | None = None
    recipient: str
    address: str
    status: str = "pending"
    latitude: float | None = None
    longitude: float | None = None
    items: str | None = None
    dispatch_date: str | None = None
    expected_delivery: str | None = None
    tracking_id: str | None = None
    notes: str | None = None

class DeliveryRead(BaseModel):
    id: int
    order_id: int | None = None
    recipient: str
    address: str
    status: str
    latitude: float | None = None
    longitude: float | None = None
    created_at: datetime
    items: str | None = None
    dispatch_date: str | None = None
    expected_delivery: str | None = None
    tracking_id: str | None = None
    notes: str | None = None
    class Config:
        from_attributes = True

class VendorProofRead(BaseModel):
    id: int
    vendor_id: int
    order_id: int
    proof_file: str | None = None
    proof_status: str
    uploaded_at: datetime
    reviewed_at: datetime | None = None
    reviewed_by: str | None = None
    comments: str | None = None
    class Config:
        from_attributes = True

class DeliveryWithOrder(BaseModel):
    id: int
    order_id: int | None = None
    recipient: str
    address: str
    status: str
    latitude: float | None = None
    longitude: float | None = None
    created_at: datetime
    order: OrderRead | None = None
    vendor_proof: VendorProofRead | None = None  # New field for vendor proof
    class Config:
        from_attributes = True

class ShipmentCreate(BaseModel):
    order_id: int | None = None
    delivery_id: int | None = None
    status: str = "pending"
    tracking_number: str | None = None
    carrier: str | None = None
    shipped_date: datetime | None = None
    expected_delivery_date: datetime | None = None
    notes: str | None = None

class ShipmentRead(BaseModel):
    id: int
    order_id: int | None = None
    delivery_id: int | None = None
    status: str
    tracking_number: str | None = None
    carrier: str | None = None
    shipped_date: datetime | None = None
    expected_delivery_date: datetime | None = None
    notes: str | None = None
    created_at: datetime
    class Config:
        from_attributes = True

class SystemConfigSchema(BaseModel):
    company_name: str | None = None
    address: str | None = None
    notifications_enabled: bool = True
    default_reorder_threshold: int | None = None
    default_pricing_markup: float | None = None
    low_stock_alert_level: int | None = None
    expiry_alert_days: int | None = None
    custom_alert_rules: str | None = None
    class Config:
        from_attributes = True

class IntegrationConfigSchema(BaseModel):
    class Config:
        from_attributes = True

class VendorCreate(BaseModel):
    name: str
    company: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None

class VendorRead(BaseModel):
    id: int
    name: str
    company: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    class Config:
        from_attributes = True

class VendorProofCreate(BaseModel):
    vendor_id: int
    order_id: int
    proof_file: str | None = None
    comments: str | None = None

class VendorProofUpdate(BaseModel):
    proof_status: str
    comments: str | None = None 

class ReturnBase(BaseModel):
    id: str
    date: str
    customer: str
    status: str

class ReturnCreate(ReturnBase):
    pass

class ReturnRead(ReturnBase):
    class Config:
        orm_mode = True 