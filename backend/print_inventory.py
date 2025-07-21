from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Inventory

engine = create_engine("sqlite:///smartchain.db")
SessionLocal = sessionmaker(bind=engine)
session = SessionLocal()

items = session.query(Inventory).all()
if not items:
    print("No inventory items found.")
else:
    for item in items:
        print(f"ID: {item.id}, Name: {item.name}, Stock: {item.stock}, SKU: {item.sku}")

session.close() 