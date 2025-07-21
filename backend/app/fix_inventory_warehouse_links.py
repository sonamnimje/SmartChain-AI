import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.database import engine
from app.models import Inventory, Product, Warehouse

from sqlalchemy.orm import sessionmaker

Session = sessionmaker(bind=engine)
db = Session()

updated = 0
for inv in db.query(Inventory).all():
    if not inv.location:
        continue
    warehouse = db.query(Warehouse).filter(Warehouse.name == inv.location).first()
    if not warehouse:
        continue
    # Find product by name and (optionally) missing warehouse_id
    product = db.query(Product).filter(Product.name == inv.name).first()
    if product and (product.warehouse_id != warehouse.id):
        product.warehouse_id = warehouse.id
        updated += 1
        print(f"Updated Product: {product.name} -> warehouse_id {warehouse.id}")
db.commit()
print(f"Done. Updated {updated} products.")
db.close() 