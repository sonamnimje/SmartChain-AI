import sqlite3
from datetime import datetime

DB_PATH = 'backend/smartchain.db'

# Default values for each column
DEFAULTS = {
    'image': '',
    'location': '',
    'status': '',
    'sku': '',
    'description': '',
    'reorder_threshold': 0,
    'expiry_date': '1970-01-01T00:00:00',
    'last_updated': '1970-01-01T00:00:00',
}

def fix_nulls():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    for col, default in DEFAULTS.items():
        cursor.execute(f"UPDATE inventory SET {col} = ? WHERE {col} IS NULL", (default,))
        print(f"Set NULLs in {col} to {default!r}")
    conn.commit()
    conn.close()

if __name__ == '__main__':
    fix_nulls() 