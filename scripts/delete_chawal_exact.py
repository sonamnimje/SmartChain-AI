import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))
from app.database import engine
from app.models import Product
from sqlalchemy.orm import sessionmaker

Session = sessionmaker(bind=engine)
db = Session()

name = "Chawal ( 1 KG )"
products = db.query(Product).filter(Product.name == name).all()
count = 0
for p in products:
    db.delete(p)
    count += 1

db.commit()
print(f"Deleted {count} product records with name '{name}'.")
db.close() 