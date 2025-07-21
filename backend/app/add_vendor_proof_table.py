from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Database URL
DATABASE_URL = "sqlite:///./smartchain.db"

# Create engine
engine = create_engine(DATABASE_URL)

# Create base class
Base = declarative_base()

# Define VendorProof model
class VendorProof(Base):
    __tablename__ = "vendor_proofs"
    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, nullable=False)
    order_id = Column(Integer, nullable=False)
    proof_file = Column(Text, nullable=True)  # File path or base64 data
    proof_status = Column(String, default="pending")  # pending, approved, rejected
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)
    reviewed_by = Column(String, nullable=True)
    comments = Column(Text, nullable=True)

def add_vendor_proof_table():
    """Add the vendor_proofs table to the database"""
    try:
        # Create the table
        VendorProof.__table__.create(engine, checkfirst=True)
        print("✅ VendorProof table created successfully!")
        
        # Verify the table exists
        with engine.connect() as conn:
            result = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='vendor_proofs'")
            if result.fetchone():
                print("✅ VendorProof table verified in database")
            else:
                print("❌ VendorProof table not found in database")
                
    except Exception as e:
        print(f"❌ Error creating VendorProof table: {e}")

if __name__ == "__main__":
    add_vendor_proof_table() 