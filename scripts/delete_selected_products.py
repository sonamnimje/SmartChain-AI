import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))
from app.database import engine
from app.models import Inventory, Product
from sqlalchemy.orm import sessionmaker

Session = sessionmaker(bind=engine)
db = Session()

product_names = [
    'Chawal ( 1 KG )',
    'Roti',
    'Roti ( 10 Inch )'
]

total_inventory_deleted = 0
total_products_deleted = 0

for name in product_names:
    # Delete inventory records
    inventory_items = db.query(Inventory).filter(Inventory.name == name).all()
    for item in inventory_items:
        db.delete(item)
        total_inventory_deleted += 1
    # Delete product records
    product_items = db.query(Product).filter(Product.name == name).all()
    for product in product_items:
        db.delete(product)
        total_products_deleted += 1

db.commit()
print(f"Deleted {total_inventory_deleted} inventory records and {total_products_deleted} product records for: {', '.join(product_names)} from all warehouses.")
db.close() 