#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import User
from app.crud import pwd_context

def create_test_user():
    db = SessionLocal()
    try:
        # Check if test user already exists
        existing_user = db.query(User).filter(User.email == "admin@smartchain.com").first()
        if existing_user:
            print("Test user already exists!")
            return
        
        # Create test user
        hashed_password = pwd_context.hash("admin123")
        test_user = User(
            email="admin@smartchain.com",
            hashed_password=hashed_password,
            name="Admin User",
            phone="1234567890",
            role="admin",
            username="admin"
        )
        
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        print("Test user created successfully!")
        print("Email: admin@smartchain.com")
        print("Password: admin123")
        
    except Exception as e:
        print(f"Error creating test user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user() 