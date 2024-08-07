import database
import datetime
import influxdb_utils
import notifications

def check_price(cursor, client, access_token):
    ticker_id_list = database.fetch_ticker_id_list(cursor)

    for ticker_id in ticker_id_list:
        start_time = datetime.datetime.now().replace(hour=0, minute=0, second=0, microsecond=0).isoformat() + 'Z'
        end_time = datetime.datetime.now().replace(hour=23, minute=59, second=59, microsecond=999999).isoformat() + 'Z'
        result = influxdb_utils.is_latest_data_max_or_min(client, ticker_id, start_time, end_time)

        if result == False:
            continue

        ticker_name = database.fetch_ticker_name(cursor, ticker_id)

        if result == 'max':
            notifications.send_notification(access_token, f"Latest data for ticker \"{ticker_name}\" is the maximum value")
        elif result == 'min':
            notifications.send_notification(access_token, f"Latest data for ticker \"{ticker_name}\" is the minimum value")
