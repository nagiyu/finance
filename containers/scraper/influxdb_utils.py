from datetime import datetime
from influxdb import InfluxDBClient

INFLUXDB_HOST = 'influxdb'
INFLUXDB_PORT = 8086
INFLUXDB_DB = 'stock_prices'

def create_influxdb_client():
    """Create InfluxDB client."""
    return InfluxDBClient(host=INFLUXDB_HOST, port=INFLUXDB_PORT, database=INFLUXDB_DB)

def write_to_influxdb(client, ticker, stock_price):
    """Write stock price data to InfluxDB."""
    json_body = [
        {
            "measurement": "stock_price",
            "tags": {
                "stock": ticker
            },
            "time": datetime.utcnow().isoformat(),
            "fields": {
                "price": stock_price
            }
        }
    ]
    client.write_points(json_body)

def read_from_influxdb(client, ticker):
    """Read stock price data from InfluxDB."""
    query = f"""
        SELECT
            *
        FROM
            stock_price
        WHERE
            "stock" = \'{ticker}\'
        ORDER BY
            time DESC
    """

    result = client.query(query)
    points = list(result.get_points())

    if points:
        return points

    return None

def get_max_min_influxdb(client, ticker, start_time, end_time):
    query = f"""
        SELECT
            MAX(price) as max_price,
            MIN(price) as min_price
        FROM
            stock_price
        WHERE
            "stock" = \'{ticker}\'
            AND time >= \'{start_time}\'
            AND time <= \'{end_time}\'
    """
    result = client.query(query)
    points = list(result.get_points())

    if points:
        return points[0]

    return None

def is_latest_data_max_or_min(client, ticker, start_time, end_time):
    max_min_data = get_max_min_influxdb(client, ticker, start_time, end_time)
    latest_data = read_from_influxdb(client, ticker)

    if not max_min_data or not latest_data:
        return False

    latest_price = latest_data[0]['price']
    max_price = max_min_data['max_price']
    min_price = max_min_data['min_price']

    if latest_price == max_price:
        return 'max'
    elif latest_price == min_price:
        return 'min'

    return False
