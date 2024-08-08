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
    now = datetime.datetime.now().strftime("%H:%M:%S%z")

    cursor.execute(
        """
        SELECT
            ticker_id,
            url
        FROM
            ticker_info
        WHERE
            start_time <= %s
            AND end_time >= %s
        """, (now, now))

    return {row[0]: row[1] for row in cursor.fetchall()}

def fetch_system_info():
    """Fetch system information from the database."""
    conn = get_database_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT key, value FROM system_info")

    system_info = {row[0]: row[1] for row in cursor.fetchall()}

    cursor.close()
    conn.close()

    return system_info

def update_system_status(cursor, status):
    """Update the system status in the database."""
    cursor.execute("UPDATE system_info SET value = %s WHERE key = 'status'", (status,))
    cursor.connection.commit()

def fetch_my_ticker_id_list():
    """Fetch ticker information from the database."""
    conn = get_database_connection()
    cursor = conn.cursor()

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

    result = [row[0] for row in cursor.fetchall()]

    cursor.close()
    conn.close()

    return result

def fetch_ticker_name(id):
    """Fetch ticker name from the database."""
    conn = get_database_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            ticker_name
        FROM
            ticker_info
        WHERE
            ticker_id = %s
        """, (id,))

    ticker_name = cursor.fetchone()[0]

    cursor.close()
    conn.close()

    return ticker_name
