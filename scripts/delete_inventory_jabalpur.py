import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))
from app.database import engine
from app.models import Inventory, Product, Warehouse
from sqlalchemy.orm import sessionmaker

Session = sessionmaker(bind=engine)
db = Session()

# Find the warehouse by name or location
warehouse = db.query(Warehouse).filter(
    (Warehouse.name.ilike('%jabalpur%')) | (Warehouse.location.ilike('%jabalpur%'))
).first()

if not warehouse:
    print('Warehouse with name or location containing "Jabalpur" not found.')
    sys.exit(1)

# Delete all inventory items for this warehouse
inventory_items = db.query(Inventory).filter(Inventory.warehouse_id == warehouse.id).all()
for item in inventory_items:
    # Also delete related product records
    product = db.query(Product).filter(Product.name == item.name, Product.warehouse_id == warehouse.id).first()
    if product:
        db.delete(product)
    db.delete(item)

db.commit()
print(f"Deleted {len(inventory_items)} inventory items and related products for warehouse '{warehouse.name}' (ID: {warehouse.id})")
db.close() 