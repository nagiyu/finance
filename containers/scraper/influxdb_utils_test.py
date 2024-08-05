import datetime
import influxdb_utils

def main():
    # Create InfluxDB client
    client = influxdb_utils.create_influxdb_client()
    print("InfluxDB client created:", client)

    ticker = '999'

    # Write data to InfluxDB
    stock_price = 150.0
    influxdb_utils.write_to_influxdb(client, ticker, stock_price)
    print(f"Data written to InfluxDB: {ticker} - {stock_price}")

    # Read data from InfluxDB
    result = influxdb_utils.read_from_influxdb(client, ticker)
    print("Data read from InfluxDB:", result)

    # Get max and min price from InfluxDB
    influxdb_utils.write_to_influxdb(client, ticker, 100.0)
    influxdb_utils.write_to_influxdb(client, ticker, 100.0)
    influxdb_utils.write_to_influxdb(client, ticker, 200.0)
    influxdb_utils.write_to_influxdb(client, ticker, 200.0)
    influxdb_utils.write_to_influxdb(client, ticker, 300.0)
    influxdb_utils.write_to_influxdb(client, ticker, 300.0)
    start_time = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0).isoformat() + 'Z'
    end_time = datetime.datetime.utcnow().replace(hour=23, minute=59, second=59, microsecond=999999).isoformat() + 'Z'
    result = influxdb_utils.get_max_min_influxdb(client, ticker, start_time, end_time)
    print("Max Price:", result['max_price'], "Min Price:", result['min_price'])

    # Check if latest data is max or min
    influxdb_utils.write_to_influxdb(client, ticker, 300.0)
    result = influxdb_utils.is_latest_data_max_or_min(client, ticker, start_time, end_time)
    print("Is latest data max or min:", result)
    influxdb_utils.write_to_influxdb(client, ticker, 100.0)
    result = influxdb_utils.is_latest_data_max_or_min(client, ticker, start_time, end_time)
    print("Is latest data max or min:", result)
    influxdb_utils.write_to_influxdb(client, ticker, 200.0)
    result = influxdb_utils.is_latest_data_max_or_min(client, ticker, start_time, end_time)
    print("Is latest data max or min:", result)

if __name__ == "__main__":
    main()
