#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app.models import Base, User
from app.crud import pwd_context

def check_database():
    try:
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
        
        # Test database connection
        db = SessionLocal()
        try:
            # Check if we can query the database
            user_count = db.query(User).count()
            print(f"✅ Database connection successful. Found {user_count} users.")
            
            # Check if admin user exists
            admin_user = db.query(User).filter(User.email == "admin@smartchain.com").first()
            if admin_user:
                print("✅ Admin user exists:")
                print(f"   Email: {admin_user.email}")
                print(f"   Username: {admin_user.username}")
                print(f"   Role: {admin_user.role}")
            else:
                print("❌ Admin user not found. Creating...")
                # Create admin user
                hashed_password = pwd_context.hash("admin123")
                admin_user = User(
                    email="admin@smartchain.com",
                    hashed_password=hashed_password,
                    name="Admin User",
                    phone="1234567890",
                    role="admin",
                    username="admin"
                )
                db.add(admin_user)
                db.commit()
                db.refresh(admin_user)
                print("✅ Admin user created successfully!")
                print(f"   Email: {admin_user.email}")
                print(f"   Password: admin123")
            
            # List all users
            all_users = db.query(User).all()
            print(f"\n📋 All users in database ({len(all_users)} total):")
            for user in all_users:
                print(f"   - {user.email} (username: {user.username}, role: {user.role})")
                
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🔍 Checking database status...")
    success = check_database()
    if success:
        print("\n✅ Database check completed successfully!")
    else:
        print("\n❌ Database check failed!")
        sys.exit(1) 