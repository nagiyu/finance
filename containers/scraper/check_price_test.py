import check_price
import database
import influxdb_utils

def main():
    conn = database.get_database_connection()
    cur = conn.cursor()
    client = influxdb_utils.create_influxdb_client()

    check_price.check_price(cur, client)

    cur.close()
    conn.close()

if __name__ == "__main__":
    main()
