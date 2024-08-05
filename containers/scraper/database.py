import psycopg2
import datetime

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
    cursor.execute("SELECT ticker_id, url FROM ticker_info")
    return {row[0]: row[1] for row in cursor.fetchall()}

def fetch_system_info(cursor):
    """Fetch system information from the database."""
    cursor.execute("SELECT key, value FROM system_info")
    return {row[0]: row[1] for row in cursor.fetchall()}

def update_system_status(cursor, status):
    """Update the system status in the database."""
    cursor.execute("UPDATE system_info SET value = %s WHERE key = 'status'", (status,))
    cursor.connection.commit()

def fetch_ticker_id_list(cursor):
    """Fetch ticker information from the database."""
    now = datetime.datetime.now().strftime("%H:%M:%S%z")
    cursor.execute(
        """
        SELECT
            ticker_id
        FROM
            my_ticker_info
        WHERE
            start_time <= %s
            AND end_time >= %s
        """, (now, now))

    return [row[0] for row in cursor.fetchall()]

def fetch_ticker_name(cursor, id):
    """Fetch ticker name from the database."""
    cursor.execute(
        """
        SELECT
            ticker_name
        FROM
            my_ticker_info
        WHERE
            ticker_id = %s
        """, (id,))

    return cursor.fetchone()[0]
