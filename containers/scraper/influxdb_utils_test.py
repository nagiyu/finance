import datetime
import influxdb_utils

def main():
    print(influxdb_utils.read_latest_6_from_influxdb("1"))

if __name__ == "__main__":
    main()
