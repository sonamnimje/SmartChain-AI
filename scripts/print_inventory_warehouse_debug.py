import sqlite3

# Try both possible locations for the database file
possible_paths = [
    'backend/smartchain.db',
    'smartchain.db'
]

db_path = None
for path in possible_paths:
    try:
        conn = sqlite3.connect(path)
        db_path = path
        break
    except Exception:
        continue
if db_path is None:
    print("Could not find smartchain.db in expected locations.")
    exit(1)

cursor = conn.cursor()
print(f"Using database at: {db_path}")

cursor.execute("SELECT id, name, stock, warehouse_id FROM inventory")
rows = cursor.fetchall()
if not rows:
    print("No inventory items found.")
else:
    print("Inventory items:")
    for row in rows:
        print(f"ID: {row[0]}, Name: {row[1]}, Stock: {row[2]}, Warehouse ID: {row[3]}")

conn.close() 