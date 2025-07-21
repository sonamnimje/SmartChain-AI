from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import UploadFile, File, Form
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Vendor, VendorProof, Order, Delivery
from ..schemas import VendorRead, VendorCreate, VendorProofCreate, VendorProofRead, VendorProofUpdate
import base64
from datetime import datetime
from typing import List

router = APIRouter(prefix="/vendor", tags=["vendor"])

@router.post("/login")
def vendor_login():
    return {"message": "Vendor login endpoint (to be implemented)"}

@router.get("/orders")
def vendor_orders():
    return [{"id": 1, "status": "Pending", "product": "Sample Product"}]

@router.post("/proof")
def vendor_proof():
    return {"message": "Vendor proof of shipment endpoint (to be implemented)"}

# New endpoint to get all vendors
@router.get("/all")
def get_vendors(db: Session = Depends(get_db)):
    vendors = db.query(Vendor).all()
    results = []
    for vendor in vendors:
        # Get all orders for this vendor (by vendor name in product or company)
        orders = db.query(Order).filter(Order.product.ilike(f"%{vendor.name}%")).all()
        total_orders = len(orders)
        delivered_orders = [o for o in orders if o.status == "delivered"]
        cancelled_orders = [o for o in orders if o.status == "cancelled"]
        # Punctuality: % delivered (assume all delivered are on time for now)
        punctuality = (len(delivered_orders) / total_orders * 100) if total_orders else 0
        # Order Accuracy: % not cancelled
        order_accuracy = ((total_orders - len(cancelled_orders)) / total_orders * 100) if total_orders else 0
        # Cost Trend: Placeholder
        cost_trend = "Stable"
        # Rating: Placeholder (out of 5)
        rating = 5
        results.append({
            "id": vendor.id,
            "name": vendor.name,
            "company": vendor.company,
            "email": vendor.email,
            "phone": vendor.phone,
            "address": vendor.address,
            "punctuality": f"{punctuality:.0f}%",
            "accuracy": f"{order_accuracy:.0f}%",
            "cost": cost_trend,
            "rating": rating
        })
    return results

# Endpoint to create a new vendor
@router.post("/", response_model=VendorRead)
def create_vendor(vendor: VendorCreate, db: Session = Depends(get_db)):
    db_vendor = Vendor(**vendor.dict())
    db.add(db_vendor)
    db.commit()
    db.refresh(db_vendor)
    return db_vendor

@router.delete("/{name}", response_model=VendorRead)
def delete_vendor(name: str, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.name == name).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    db.delete(vendor)
    db.commit()
    return vendor

# Vendor Proof endpoints
@router.post("/proof/upload", response_model=VendorProofRead)
async def upload_vendor_proof(
    vendor_id: int = Form(...),
    order_id: int = Form(...),
    file: UploadFile = File(...),
    comments: str = Form(None),
    db: Session = Depends(get_db)
):
    # Validate vendor and order exist
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Validate file type
    allowed_types = [".pdf", ".jpg", ".jpeg", ".png"]
    file_extension = file.filename.lower().split(".")[-1] if "." in file.filename else ""
    if f".{file_extension}" not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, JPG, JPEG, PNG allowed.")
    
    # Read and encode file
    file_content = await file.read()
    file_data = base64.b64encode(file_content).decode('utf-8')
    
    # Create vendor proof record
    vendor_proof = VendorProof(
        vendor_id=vendor_id,
        order_id=order_id,
        proof_file=file_data,
        comments=comments
    )
    
    db.add(vendor_proof)
    db.commit()
    db.refresh(vendor_proof)
    
    return vendor_proof

@router.get("/proof/all", response_model=List[VendorProofRead])
def get_all_vendor_proofs(db: Session = Depends(get_db)):
    return db.query(VendorProof).all()

@router.get("/proof/{proof_id}", response_model=VendorProofRead)
def get_vendor_proof(proof_id: int, db: Session = Depends(get_db)):
    proof = db.query(VendorProof).filter(VendorProof.id == proof_id).first()
    if not proof:
        raise HTTPException(status_code=404, detail="Vendor proof not found")
    return proof

@router.put("/proof/{proof_id}/review", response_model=VendorProofRead)
def review_vendor_proof(
    proof_id: int,
    review_data: VendorProofUpdate,
    reviewed_by: str,
    db: Session = Depends(get_db)
):
    proof = db.query(VendorProof).filter(VendorProof.id == proof_id).first()
    if not proof:
        raise HTTPException(status_code=404, detail="Vendor proof not found")
    
    proof.proof_status = review_data.proof_status
    proof.comments = review_data.comments
    proof.reviewed_at = datetime.utcnow()
    proof.reviewed_by = reviewed_by
    
    db.commit()
    db.refresh(proof)
    
    return proof

@router.get("/proof/vendor/{vendor_id}", response_model=List[VendorProofRead])
def get_vendor_proofs_by_vendor(vendor_id: int, db: Session = Depends(get_db)):
    return db.query(VendorProof).filter(VendorProof.vendor_id == vendor_id).all()

@router.get("/proof/order/{order_id}", response_model=List[VendorProofRead])
def get_vendor_proofs_by_order(order_id: int, db: Session = Depends(get_db)):
    return db.query(VendorProof).filter(VendorProof.order_id == order_id).all() 