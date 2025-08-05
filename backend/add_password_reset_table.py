from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Database URL
DATABASE_URL = "sqlite:///./smartchain.db"

# Create engine
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Create base class
Base = declarative_base()

# Define the PasswordResetToken model
class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)

def create_password_reset_table():
    """Create the password reset tokens table"""
    try:
        # Create the table
        Base.metadata.create_all(bind=engine, tables=[PasswordResetToken.__table__])
        print("✅ Password reset tokens table created successfully!")
        
        # Verify the table was created
        with engine.connect() as conn:
            from sqlalchemy import text
            result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='password_reset_tokens'"))
            if result.fetchone():
                print("✅ Table verification successful!")
            else:
                print("❌ Table verification failed!")
                
    except Exception as e:
        print(f"❌ Error creating password reset tokens table: {e}")

if __name__ == "__main__":
    print("🔄 Creating password reset tokens table...")
    create_password_reset_table() 