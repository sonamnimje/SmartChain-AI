#!/bin/bash

# Install dependencies
pip install -r requirements.txt

# Create database tables
python -c "
from app.database import engine
from app.models import Base
Base.metadata.create_all(bind=engine)
print('Database tables created successfully')
"

# Create admin user if it doesn't exist
python -c "
from app.database import SessionLocal
from app.models import User
from app.crud import pwd_context

db = SessionLocal()
try:
    existing_user = db.query(User).filter(User.email == 'admin@smartchain.com').first()
    if not existing_user:
        hashed_password = pwd_context.hash('admin123')
        admin_user = User(
            email='admin@smartchain.com',
            hashed_password=hashed_password,
            name='Admin User',
            phone='1234567890',
            role='admin',
            username='admin'
        )
        db.add(admin_user)
        db.commit()
        print('Admin user created successfully!')
    else:
        print('Admin user already exists!')
finally:
    db.close()
"

# Start the application
gunicorn app.main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT 