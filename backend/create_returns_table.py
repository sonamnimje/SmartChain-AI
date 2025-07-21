    import sqlite3

    conn = sqlite3.connect('smartchain.db')
    cursor = conn.cursor()

    # Create the returns table if it doesn't exist
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS returns (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        customer TEXT NOT NULL,
        status TEXT NOT NULL
    )
    """)

    # Insert a test record
    cursor.execute("""
    INSERT INTO returns (id, date, customer, status)
    VALUES (?, ?, ?, ?)
    """, (
        "RET-TEST-001",
        "2024-07-19 15:00:00",
        "Test Customer",
        "pending"
    ))

    conn.commit()
    print("Table created and test record inserted.")
    conn.close()