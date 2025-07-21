from sqlalchemy import create_engine, text

# Correct database path
DATABASE_URL = "sqlite:///backend/smartchain.db"
engine = create_engine(DATABASE_URL)

# Add SKU column to inventory table
with engine.connect() as conn:
    conn.execute(text('ALTER TABLE inventory ADD COLUMN sku VARCHAR;'))
    print("Added 'sku' column to inventory table.") 