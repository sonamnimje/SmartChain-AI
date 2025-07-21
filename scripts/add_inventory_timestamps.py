import sqlite3
from datetime import datetime

DB_PATH = 'backend/smartchain.db'
DEFAULT_EXPIRY = '2099-12-31'  # Set a far future date as default expiry

def backfill_inventory():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    now = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

    # Update missing created_at
    cur.execute("""
        UPDATE inventory
        SET created_at = ?
        WHERE created_at IS NULL OR created_at = ''
    """, (now,))

    # Update missing last_updated
    cur.execute("""
        UPDATE inventory
        SET last_updated = ?
        WHERE last_updated IS NULL OR last_updated = ''
    """, (now,))

    # Optionally set a default expiry_date if missing
    cur.execute("""
        UPDATE inventory
        SET expiry_date = ?
        WHERE expiry_date IS NULL OR expiry_date = ''
    """, (DEFAULT_EXPIRY,))

    conn.commit()
    print('Backfill complete.')
    conn.close()

if __name__ == '__main__':
    backfill_inventory() 