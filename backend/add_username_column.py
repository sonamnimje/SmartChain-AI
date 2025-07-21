import sqlite3

conn = sqlite3.connect("../smartchain.db")
cursor = conn.cursor()
try:
    cursor.execute("ALTER TABLE users ADD COLUMN username TEXT;")
    print("Added 'username' column to users table.")
except Exception as e:
    print("Error:", e)
conn.commit()
conn.close() 