import os

APP_DIR = os.path.dirname(os.path.abspath(__file__))  # backend/app/
BACKEND_DIR = os.path.dirname(APP_DIR)                # backend/
DB_PATH = os.path.join(BACKEND_DIR, "smartchain.db")  # backend/smartchain.db
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"
print("Using database file:", DB_PATH)

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 