import psycopg2

POSTGRES_HOST = "postgres"
POSTGRES_DB = "my_finance_manager_db"
POSTGRES_USER = "postgres"
POSTGRES_PASSWORD = "Password123!"

def get_database_connection():
    """Establish a connection to the PostgreSQL database."""
    return psycopg2.connect(
        host=POSTGRES_HOST,
        database=POSTGRES_DB,
        user=POSTGRES_USER,
        password=POSTGRES_PASSWORD
    )

def fetch_ticker_urls(cursor):
    """Fetch ticker URLs from the database."""
    cursor.execute("SELECT ticker_name, url FROM ticker_urls")
    return {row[0]: row[1] for row in cursor.fetchall()}

def fetch_system_info(cursor):
    """Fetch system information from the database."""
    cursor.execute("SELECT key, value FROM system_info")
    return {row[0]: row[1] for row in cursor.fetchall()}

def update_system_status(cursor, status):
    """Update the system status in the database."""
    cursor.execute("UPDATE system_info SET value = %s WHERE key = 'status'", (status,))
    cursor.connection.commit()
