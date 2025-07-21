import sqlite3

DB_PATH = 'backend/smartchain.db'

columns = [
    ('items', 'TEXT'),
    ('dispatch_date', 'TEXT'),
    ('expected_delivery', 'TEXT'),
    ('tracking_id', 'TEXT'),
    ('notes', 'TEXT'),
]

def column_exists(cursor, table, column):
    cursor.execute(f"PRAGMA table_info({table})")
    return any(row[1] == column for row in cursor.fetchall())

def add_columns():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    for col, coltype in columns:
        if not column_exists(cursor, 'deliveries', col):
            print(f"Adding column: {col}")
            cursor.execute(f"ALTER TABLE deliveries ADD COLUMN {col} {coltype}")
        else:
            print(f"Column already exists: {col}")
    conn.commit()
    conn.close()

if __name__ == '__main__':
    add_columns() 