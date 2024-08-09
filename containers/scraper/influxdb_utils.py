from datetime import datetime, timedelta
from influxdb import InfluxDBClient

INFLUXDB_HOST = 'influxdb'
INFLUXDB_PORT = 8086
INFLUXDB_DB = 'stock_prices'

def create_influxdb_client():
    """Create InfluxDB client."""
    return InfluxDBClient(host=INFLUXDB_HOST, port=INFLUXDB_PORT, database=INFLUXDB_DB)

def write_to_influxdb(client, ticker_id, stock_price):
    """Write stock price data to InfluxDB."""
    try:
        stock_price = float(str(stock_price).replace(",", "")) # Ensure stock_price is a float
    except ValueError:
        raise ValueError("stock_price must be a number")

    json_body = [
        {
            "measurement": "stock_price",
            "tags": {
                "ticker_id": str(ticker_id)
            },
            "time": datetime.utcnow().isoformat(),
            "fields": {
                "price": stock_price
            }
        }
    ]
    client.write_points(json_body)

def read_from_influxdb(ticker_id):
    """Read stock price data from InfluxDB."""
    client = create_influxdb_client()

    query = f"""
        SELECT
            *
        FROM
            stock_price
        WHERE
            "ticker_id" = \'{ticker_id}\'
        ORDER BY
            time DESC
    """

    result = client.query(query)
    points = list(result.get_points())

    client.close()

    if points:
        return points

    return None

def get_one_day_data(ticker_id):
    client = create_influxdb_client()

    start_time = (datetime.utcnow() - timedelta(days=1)).isoformat() + 'Z'
    end_time = datetime.utcnow().isoformat() + 'Z'

    query = f"""
        SELECT
            *
        FROM
            stock_price
        WHERE
            "ticker_id" = \'{ticker_id}\'
            AND time >= \'{start_time}\'
            AND time <= \'{end_time}\'
        ORDER BY
            time DESC
    """

    result = client.query(query)
    points = list(result.get_points())

    client.close()

    if points:
        return points

    return None

def read_latest_2_from_influxdb(ticker_id):
    """Read latest stock price data from InfluxDB."""
    client = create_influxdb_client()

    query = f"""
        SELECT
            *
        FROM
            stock_price
        WHERE
            "ticker_id" = \'{ticker_id}\'
        ORDER BY
            time DESC
        LIMIT 2
    """

    result = client.query(query)
    points = list(result.get_points())

    client.close()

    if points:
        return points

    return None

def read_latest_6_from_influxdb(ticker_id):
    """Read latest stock price data from InfluxDB."""
    client = create_influxdb_client()

    query = f"""
        SELECT
            *
        FROM
            stock_price
        WHERE
            "ticker_id" = \'{ticker_id}\'
        ORDER BY
            time DESC
        LIMIT 6
    """

    result = client.query(query)
    points = list(result.get_points())

    client.close()

    if points:
        return points

    return None

def get_max_min_influxdb(client, ticker_id, start_time, end_time):
    query = f"""
        SELECT
            MAX(price) as max_price,
            MIN(price) as min_price
        FROM
            stock_price
        WHERE
            "ticker_id" = \'{ticker_id}\'
            AND time >= \'{start_time}\'
            AND time <= \'{end_time}\'
    """
    result = client.query(query)
    points = list(result.get_points())

    if points:
        return points[0]

    return None

def get_max_min_last_24h(ticker_id):
    client = create_influxdb_client()

    start_time = (datetime.utcnow() - timedelta(days=1)).isoformat() + 'Z'
    end_time = datetime.utcnow().isoformat() + 'Z'

    result = get_max_min_influxdb(client, ticker_id, start_time, end_time)

    client.close()

    return result

def is_latest_data_max_or_min(client, ticker_id, start_time, end_time):
    max_min_data = get_max_min_influxdb(client, ticker_id, start_time, end_time)
    latest_data = read_from_influxdb(ticker_id)

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
