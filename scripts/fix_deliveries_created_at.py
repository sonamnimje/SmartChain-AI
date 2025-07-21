import sqlite3
from datetime import datetime

DB_PATH = 'backend/smartchain.db'

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Set created_at to now for any deliveries where it is NULL or empty
now = datetime.utcnow().isoformat()
cursor.execute("UPDATE deliveries SET created_at = ? WHERE created_at IS NULL OR created_at = ''", (now,))
print(f"Updated {cursor.rowcount} deliveries with missing created_at.")

conn.commit()
conn.close() 