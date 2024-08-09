import datetime
import matplotlib.pyplot as plt
import time

import database
import influxdb_utils
import notifications

def main():
    result = influxdb_utils.get_one_day_data("1")

    times = [point["time"] for point in result]
    prices = [point["price"] for point in result]
    plt.plot(times, prices)
    path = f"/output/{int(time.time())}.png"
    plt.savefig(path)

    system_info = database.fetch_system_info()
    access_token = system_info["access_token"]

    notifications.send_notification_with_image(access_token, "One day data", path)

if __name__ == "__main__":
    main()
