import sqlite3

conn = sqlite3.connect('backend/smartchain.db')
c = conn.cursor()
c.execute("UPDATE warehouses SET status = 'active' WHERE status IS NULL OR status = ''")
conn.commit()
conn.close()
print("All warehouse statuses set to 'active'.") 