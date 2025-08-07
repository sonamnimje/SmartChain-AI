#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.crud import authenticate_user, get_user_by_username, pwd_context

def test_login():
    print("🔍 Testing login functionality...")
    
    db = SessionLocal()
    try:
        # Test 1: Login with admin email
        print("\n1. Testing login with admin email (admin@smartchain.com)...")
        user = authenticate_user(db, "admin@smartchain.com", "admin123")
        if user:
            print(f"✅ Login successful with email!")
            print(f"   User: {user.email}")
            print(f"   Username: {user.username}")
            print(f"   Role: {user.role}")
        else:
            print("❌ Login failed with email")
        
        # Test 2: Login with admin username
        print("\n2. Testing login with admin username (admin)...")
        user_by_username = get_user_by_username(db, "admin")
        if user_by_username and pwd_context.verify("admin123", user_by_username.hashed_password):
            print(f"✅ Login successful with username!")
            print(f"   User: {user_by_username.email}")
            print(f"   Username: {user_by_username.username}")
            print(f"   Role: {user_by_username.role}")
        else:
            print("❌ Login failed with username")
        
        # Test 3: Test other users
        print("\n3. Testing login with other users...")
        test_users = [
            ("sonamnimje27@gmail.com", "password123"),
            ("testuser123@example.com", "password123")
        ]
        
        for email, password in test_users:
            print(f"\n   Testing {email}...")
            user = authenticate_user(db, email, password)
            if user:
                print(f"   ✅ Login successful!")
                print(f"      User: {user.email}")
                print(f"      Username: {user.username}")
                print(f"      Role: {user.role}")
            else:
                print(f"   ❌ Login failed - incorrect password or user not found")
        
        # Test 4: Test non-existent user
        print("\n4. Testing non-existent user...")
        user = authenticate_user(db, "nonexistent@example.com", "password123")
        if user:
            print("❌ Unexpected success with non-existent user")
        else:
            print("✅ Correctly rejected non-existent user")
            
    finally:
        db.close()

if __name__ == "__main__":
    test_login() 