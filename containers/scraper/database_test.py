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

    # Fetch ticker information from the database
    ticker_info = database.fetch_ticker_id_list(cur)
    print("Ticker information fetched from the database:", ticker_info)

    # Fetch ticker name from the database
    ticker_name = database.fetch_ticker_name(cur, 3)
    print("Ticker name fetched from the database:", ticker_name)

    cur.close()
    conn.close()

if __name__ == "__main__":
    main()
