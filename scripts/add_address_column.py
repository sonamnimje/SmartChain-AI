import sqlite3

conn = sqlite3.connect('backend/smartchain.db')
c = conn.cursor()
try:
    c.execute("ALTER TABLE orders ADD COLUMN address TEXT;")
    print("Column 'address' added to 'orders' table.")
except Exception as e:
    if 'duplicate column name' in str(e):
        print("Column 'address' already exists in 'orders' table.")
    else:
        print("Error:", e)
conn.commit()
conn.close() 