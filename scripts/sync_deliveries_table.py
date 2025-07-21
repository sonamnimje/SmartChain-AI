import sqlite3

# Define the columns to ensure exist in the deliveries table
COLUMNS = [
    ("latitude", "FLOAT"),
    ("longitude", "FLOAT"),
    ("items", "TEXT"),
    ("dispatch_date", "TEXT"),
    ("expected_delivery", "TEXT"),
    ("tracking_id", "TEXT"),
    ("notes", "TEXT"),
    ("order_id", "INTEGER"),
    ("created_at", "DATETIME"),
]

db_path = 'smartchain.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(deliveries);")
existing_columns = [row[1] for row in cursor.fetchall()]

added = []
for col, coltype in COLUMNS:
    if col not in existing_columns:
        try:
            cursor.execute(f"ALTER TABLE deliveries ADD COLUMN {col} {coltype};")
            added.append(col)
        except Exception as e:
            print(f"Failed to add column {col}: {e}")

if added:
    print(f"Added columns to deliveries table: {', '.join(added)}")
else:
    print("All required columns already exist in deliveries table.")

conn.commit()
conn.close() 