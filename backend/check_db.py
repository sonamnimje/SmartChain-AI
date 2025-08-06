#!/usr/bin/env python3
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

def check_database():
    # Get database URL from environment variable or use default SQLite
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./smartchain.db")
    
    print("=== SmartChain AI Database Information ===")
    print(f"Database URL: {DATABASE_URL}")
    
    # Handle Render's PostgreSQL URL format
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # Create engine
    if "sqlite" in DATABASE_URL:
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        print("Database Type: SQLite")
    else:
        engine = create_engine(DATABASE_URL)
        print("Database Type: PostgreSQL")
    
    try:
        # Test connection
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("Connection Status: ✅ Connected")
            
            # Get database info
            if "sqlite" in DATABASE_URL:
                # SQLite specific info
                result = connection.execute(text("PRAGMA database_list"))
                db_info = result.fetchone()
                print(f"Database File: {db_info[2] if db_info else 'smartchain.db'}")
                
                # Get table count
                result = connection.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
                tables = result.fetchall()
                print(f"Number of Tables: {len(tables)}")
                print("Tables:", [table[0] for table in tables])
            else:
                # PostgreSQL specific info
                result = connection.execute(text("SELECT current_database()"))
                db_name = result.fetchone()[0]
                print(f"Database Name: {db_name}")
                
                # Get table count
                result = connection.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
                tables = result.fetchall()
                print(f"Number of Tables: {len(tables)}")
                print("Tables:", [table[0] for table in tables])
                
    except Exception as e:
        print(f"Connection Status: ❌ Error - {e}")

if __name__ == "__main__":
    check_database() 