#!/bin/bash

# Create database tables
python -c "
from app.database import engine
from app.models import Base
Base.metadata.create_all(bind=engine)
print('Database tables created successfully')
"

# Start the application
gunicorn app.main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT 