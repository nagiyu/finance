import database

def main():
    # Establish a connection to the PostgreSQL database
    conn = database.get_database_connection()
    print("Database connection established:", conn)

    # Fetch ticker URLs from the database
    cur = conn.cursor()
    ticker_urls = database.fetch_ticker_urls(cur)
    print("Ticker URLs fetched from the database:", ticker_urls)

    # Fetch system information from the database
    system_info = database.fetch_system_info(cur)
    print("System information fetched from the database:", system_info)

    cur.close()
    conn.close()

if __name__ == "__main__":
    main()
