import sqlite3
import os

db_path = 'smartchain.db'  # Use the project root database

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check if the column already exists
cursor.execute("PRAGMA table_info(deliveries);")
columns = [row[1] for row in cursor.fetchall()]

if 'order_id' in columns:
    print("order_id column already exists in deliveries table.")
else:
    try:
        cursor.execute("ALTER TABLE deliveries ADD COLUMN order_id INTEGER;")
        conn.commit()
        print("order_id column added to deliveries table.")
    except Exception as e:
        print(f"Failed to add order_id column: {e}")

conn.close() 