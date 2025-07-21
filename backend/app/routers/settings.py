from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import User, SystemConfig, IntegrationConfig
from .. import schemas
from passlib.context import CryptContext

router = APIRouter(prefix="/settings", tags=["settings"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# User profile (per-user, for demo just get/set first user)
@router.get("/profile", response_model=schemas.UserRead)
def get_profile(db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/profile", response_model=schemas.UserRead)
def update_profile(profile: schemas.UserRead, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == profile.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.email = profile.email
    user.role = profile.role
    user.is_active = profile.is_active
    user.name = profile.name
    user.phone = profile.phone
    user.avatar = profile.avatar
    db.commit()
    db.refresh(user)
    return user

# System config (global)
@router.get("/system", response_model=schemas.SystemConfigSchema)
def get_system_config(db: Session = Depends(get_db)):
    config = db.query(SystemConfig).first()
    if not config:
        config = SystemConfig(company_name="", address="", notifications_enabled=True)
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

@router.put("/system", response_model=schemas.SystemConfigSchema)
def update_system_config(cfg: schemas.SystemConfigSchema, db: Session = Depends(get_db)):
    config = db.query(SystemConfig).first()
    if not config:
        config = SystemConfig()
        db.add(config)
    config.company_name = cfg.company_name
    config.address = cfg.address
    config.notifications_enabled = cfg.notifications_enabled
    config.default_reorder_threshold = cfg.default_reorder_threshold
    config.default_pricing_markup = cfg.default_pricing_markup
    config.low_stock_alert_level = cfg.low_stock_alert_level
    config.expiry_alert_days = cfg.expiry_alert_days
    config.custom_alert_rules = cfg.custom_alert_rules
    db.commit()
    db.refresh(config)
    return config

# Security: change password (per-user, for demo just first user)
@router.post("/change-password")
def change_password(password: str = Body(...), db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = pwd_context.hash(password)
    db.commit()
    return {"detail": "Password changed"}

# Integrations (global)
@router.get("/integrations", response_model=schemas.IntegrationConfigSchema)
def get_integration_config(db: Session = Depends(get_db)):
    config = db.query(IntegrationConfig).first()
    if not config:
        config = IntegrationConfig()
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

@router.put("/integrations", response_model=schemas.IntegrationConfigSchema)
def update_integration_config(cfg: schemas.IntegrationConfigSchema, db: Session = Depends(get_db)):
    config = db.query(IntegrationConfig).first()
    if not config:
        config = IntegrationConfig()
        db.add(config)
    db.commit()
    db.refresh(config)
    return config 