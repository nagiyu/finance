import matplotlib.pyplot as plt
import time

import database
import influxdb_utils
import notifications

def check_price():
    ticker_id_list = database.fetch_my_ticker_id_list()

    for ticker_id in ticker_id_list:
        if (check_latest_2_price(ticker_id) != True):
            continue

        check_price_trend(ticker_id)
        check_price_trend_down(ticker_id)

        check_max_min_price(ticker_id)

def check_latest_2_price(ticker_id):
    points = influxdb_utils.read_latest_2_from_influxdb(ticker_id)

    print(points)

    if not points:
        return True

    return points[0]['price'] != points[1]['price']

def create_plot(ticker_id):
    result = influxdb_utils.get_one_day_data(ticker_id)

    times = [point["time"] for point in result]
    prices = [point["price"] for point in result]

    plt.plot(times, prices)
    path = f"/output/{int(time.time())}.png"
    plt.savefig(path)

    return path

def check_max_min_price(ticker_id):
    result = influxdb_utils.get_max_min_last_24h(ticker_id)

    if result == False:
        return

    ticker_name = database.fetch_ticker_name(ticker_id)

    system_info = database.fetch_system_info()
    access_token = system_info["access_token"]

    if result == 'max':
        notifications.send_notification(access_token, f"Latest data for ticker \"{ticker_name}\" is the maximum value")
    elif result == 'min':
        notifications.send_notification(access_token, f"Latest data for ticker \"{ticker_name}\" is the minimum value")

def check_price_trend(ticker_id):
    points = influxdb_utils.read_latest_6_from_influxdb(ticker_id)

    if not points:
        return

    prices = [point['price'] for point in points]

    if prices == sorted(prices, reverse=True):
        ticker_name = database.fetch_ticker_name(ticker_id)

        system_info = database.fetch_system_info()
        access_token = system_info["access_token"]

        notifications.send_notification(access_token, f"Stock price for ticker \"{ticker_name}\" has been rising for the last 6 data points")

def check_price_trend_down(ticker_id):
    points = influxdb_utils.read_latest_6_from_influxdb(ticker_id)

    if not points:
        return

    prices = [point['price'] for point in points]

    if prices == sorted(prices):
        ticker_name = database.fetch_ticker_name(ticker_id)

        system_info = database.fetch_system_info()
        access_token = system_info["access_token"]

        notifications.send_notification(access_token, f"Stock price for ticker \"{ticker_name}\" has been falling for the last 6 data points")
