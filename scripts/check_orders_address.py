import sqlite3

conn = sqlite3.connect('backend/smartchain.db')
c = conn.cursor()
print("Order ID | Address")
for row in c.execute("SELECT id, address FROM orders"):
    print(row)
conn.close() 