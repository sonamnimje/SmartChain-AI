import sqlite3
import os

# Try both possible locations for the database file
possible_paths = [
    'backend/smartchain.db',
    'smartchain.db'
]

conn = None
for path in possible_paths:
    if os.path.exists(path):
        conn = sqlite3.connect(path)
        print(f"Using database at: {path}")
        break
if conn is None:
    raise FileNotFoundError("Could not find smartchain.db in expected locations.")

cursor = conn.cursor()

# Check if column already exists
cursor.execute("PRAGMA table_info(inventory);")
columns = [col[1] for col in cursor.fetchall()]
if 'warehouse_id' not in columns:
    cursor.execute("ALTER TABLE inventory ADD COLUMN warehouse_id INTEGER;")
    print("Added warehouse_id column to inventory table.")
else:
    print("warehouse_id column already exists in inventory table.")

conn.commit()
conn.close() 