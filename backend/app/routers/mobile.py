from fastapi import APIRouter

router = APIRouter(prefix="/mobile", tags=["mobile"])

@router.get("/inventory")
def mobile_inventory():
    return [{"id": 1, "name": "Sample Product", "stock": 100}]

@router.post("/delivery-scan")
def delivery_scan():
    return {"message": "Delivery scan endpoint (to be implemented)"}

@router.get("/route-navigation")
def route_navigation():
    return {"message": "Route navigation endpoint (to be implemented)"} 