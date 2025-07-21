import sqlite3

DB_PATH = 'backend/smartchain.db'

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

# Check if 'created_at' column exists
c.execute("PRAGMA table_info(shipments);")
columns = [row[1] for row in c.fetchall()]

if 'created_at' not in columns:
    c.execute("ALTER TABLE shipments ADD COLUMN created_at DATETIME;")
    print("'created_at' column added to shipments table.")
else:
    print("'created_at' column already exists in shipments table.")

conn.commit()
conn.close() 