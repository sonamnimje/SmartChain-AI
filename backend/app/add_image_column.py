import sqlite3

DB_PATH = 'backend/smartchain.db'

# List of expected columns and their types
EXPECTED_COLUMNS = {
    'id': 'INTEGER PRIMARY KEY',
    'name': 'TEXT',
    'stock': 'INTEGER',
    'category': 'TEXT',
    'image': 'TEXT',
    'location': 'TEXT',
    'status': 'TEXT',
    'last_updated': 'TEXT',
    'sku': 'TEXT',
    'description': 'TEXT',
    'reorder_threshold': 'INTEGER',
    'expiry_date': 'TEXT',
    'created_at': 'TEXT',
}

def add_missing_columns():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(inventory);")
    existing_columns = [col[1] for col in cursor.fetchall()]
    for col, col_type in EXPECTED_COLUMNS.items():
        if col not in existing_columns:
            try:
                cursor.execute(f"ALTER TABLE inventory ADD COLUMN {col} {col_type};")
                print(f"Added column: {col} ({col_type})")
            except Exception as e:
                print(f"Failed to add column {col}: {e}")
        else:
            print(f"Column exists: {col}")
    conn.commit()
    conn.close()

if __name__ == '__main__':
    add_missing_columns() 