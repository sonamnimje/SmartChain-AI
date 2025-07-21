import sqlite3

DB_PATH = 'backend/smartchain.db'

def print_inventory_fields():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT id, name, expiry_date, last_updated, created_at FROM inventory;")
    rows = cur.fetchall()
    print(f"{'ID':<5} {'Name':<20} {'Expiry':<15} {'Last Updated':<25} {'Created At':<25}")
    print('-'*90)
    for row in rows:
        print(f"{row[0]:<5} {row[1]:<20} {str(row[2]):<15} {str(row[3]):<25} {str(row[4]):<25}")
    conn.close()

if __name__ == '__main__':
    print_inventory_fields() 