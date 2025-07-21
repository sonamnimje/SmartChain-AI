import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))
from app.database import engine
from app.models import Inventory, Product
from sqlalchemy.orm import sessionmaker

Session = sessionmaker(bind=engine)
db = Session()

# List all product names containing 'Chawal' (case-insensitive)
product_matches = db.query(Product).filter(Product.name.ilike('%chawal%')).all()
inventory_matches = db.query(Inventory).filter(Inventory.name.ilike('%chawal%')).all()

print('Products containing "Chawal":')
for p in product_matches:
    print(f"- {p.name} (warehouse_id: {p.warehouse_id}, quantity: {getattr(p, 'quantity', 'N/A')})")

print('\nInventory items containing "Chawal":')
for i in inventory_matches:
    print(f"- {i.name} (warehouse_id: {i.warehouse_id}, stock: {getattr(i, 'stock', 'N/A')})")

db.close() 