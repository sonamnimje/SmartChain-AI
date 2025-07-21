import sqlite3

conn = sqlite3.connect("../smartchain.db")
cursor = conn.cursor()

columns = [
    ("username", "TEXT"),
    ("location", "TEXT"),
    ("avatar", "TEXT"),
    ("phone", "TEXT"),
    ("role", "TEXT"),
    ("is_active", "BOOLEAN"),
    ("name", "TEXT")
]

for col, coltype in columns:
    try:
        cursor.execute(f"ALTER TABLE users ADD COLUMN {col} {coltype};")
        print(f"Added column: {col} ({coltype})")
    except Exception as e:
        print(f"Could not add column {col}: {e}")

conn.commit()
conn.close() 