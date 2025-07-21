import sqlite3

conn = sqlite3.connect('backend/smartchain.db')
c = conn.cursor()
c.execute("UPDATE orders SET address = '' WHERE address IS NULL;")
conn.commit()
conn.close()
print("Set default address for all orders where it was missing.") 