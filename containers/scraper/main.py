import docker
import time
import random
import requests
import os
from datetime import datetime
from urllib.parse import urlparse, urljoin
from urllib.robotparser import RobotFileParser
from selenium import webdriver
from selenium.common.exceptions import WebDriverException, TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from influxdb import InfluxDBClient
import psycopg2

# Constants
WAIT_INTERVAL = 30
MAX_RETRIES = 10
SELENIUM_REMOTE_URL = os.getenv('SELENIUM_REMOTE_URL', 'http://selenium:4444/wd/hub')
INFLUXDB_HOST = 'influxdb'
INFLUXDB_PORT = 8086
INFLUXDB_DB = 'stock_prices'
POSTGRES_HOST = "postgres"
POSTGRES_DB = "my_finance_manager_db"
POSTGRES_USER = "postgres"
POSTGRES_PASSWORD = "Password123!"

client = docker.from_env()

def can_fetch(url):
    """Check if the URL can be fetched based on robots.txt."""
    parsed_url = urlparse(url)
    robots_url = urljoin(f"{parsed_url.scheme}://{parsed_url.netloc}", "/robots.txt")
    response = requests.get(robots_url)
    if response.status_code == 200:
        rp = RobotFileParser()
        rp.parse(response.text.split('\n'))
        return rp.can_fetch("*", url)
    return False

def get_database_connection():
    """Establish a connection to the PostgreSQL database."""
    return psycopg2.connect(
        host=POSTGRES_HOST,
        database=POSTGRES_DB,
        user=POSTGRES_USER,
        password=POSTGRES_PASSWORD
    )

def fetch_ticker_urls(cursor):
    """Fetch ticker URLs from the database."""
    cursor.execute("SELECT ticker_name, url FROM ticker_urls")
    return {row[0]: row[1] for row in cursor.fetchall()}

def fetch_system_info(cursor):
    """Fetch system information from the database."""
    cursor.execute("SELECT key, value FROM system_info")
    return {row[0]: row[1] for row in cursor.fetchall()}

def update_system_status(cursor, status):
    """Update the system status in the database."""
    cursor.execute("UPDATE system_info SET value = %s WHERE key = 'status'", (status,))
    cursor.connection.commit()

def write_to_influxdb(ticker, stock_price):
    """Write stock price data to InfluxDB."""
    client = InfluxDBClient(host=INFLUXDB_HOST, port=INFLUXDB_PORT, database=INFLUXDB_DB)
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

def send_warning_notification(message):
    """Send error notification with a screenshot."""
    with open(f"/output/{int(time.time())}.txt", "w") as f:
        f.write(str(e))

    response = requests.get("http://secret/Secret/AlertAccessToken")
    access_token = response.json()["value"]
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": f"Bearer {access_token}"
    }
    payload = {
        "message": f"Warning: {message}"
    }
    requests.post("https://notify-api.line.me/api/notify", headers=headers, params=payload)

def send_error_notification(message):
    """Send error notification with a screenshot."""
    with open(f"/output/{int(time.time())}.txt", "w") as f:
        f.write(str(e))

    response = requests.get("http://secret/Secret/ErrorAccessToken")
    access_token = response.json()["value"]
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": f"Bearer {access_token}"
    }
    payload = {
        "message": f"Error: {message}"
    }
    requests.post("https://notify-api.line.me/api/notify", headers=headers, params=payload)

def send_error_notification_with_image(driver, e):
    """Send error notification with a screenshot."""
    with open(f"/output/{int(time.time())}.txt", "w") as f:
        f.write(str(e))

    screenshot_path = f"/output/{int(time.time())}.png"
    driver.save_screenshot(screenshot_path)

    response = requests.get("http://secret/Secret/ErrorAccessToken")
    access_token = response.json()["value"]
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": f"Bearer {access_token}"
    }
    payload = {
        "message": f"Error accessing element on URL: {driver.current_url}, Error: {e}"
    }
    files = {
        "imageFile": open(screenshot_path, "rb")
    }
    requests.post("https://notify-api.line.me/api/notify", headers=headers, params=payload, files=files)

def initialize_driver():
    """Initialize the Selenium WebDriver."""
    options = Options()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    for _ in range(MAX_RETRIES):
        try:
            driver = webdriver.Remote(command_executor=SELENIUM_REMOTE_URL, options=options)
            return driver
        except Exception as e:
            print(f"Retrying connection to Selenium server: {e}")
            time.sleep(5)
    return None

def process_tabs(driver, cursor, ticker_urls, system_info):
    """Process each tab to fetch stock prices."""
    driver.get(system_info["login_url"])

    # Wait for the user to login
    while True:
        cursor.execute("SELECT value FROM system_info WHERE key = 'status'")
        if cursor.fetchone()[0] == "true":
            break
        time.sleep(5)

    # Open tabs for each ticker
    for ticker, url in ticker_urls.items():
        if can_fetch(url):
            driver.execute_script("window.open('');")
            driver.switch_to.window(driver.window_handles[-1])
            driver.get(url)
            time.sleep(5)
        else:
            print(f"Fetching not allowed by robots.txt: {url}")

    # Close the first tab
    driver.switch_to.window(driver.window_handles[0])
    driver.close()

    # Process each tab
    last_reload_times = {handle: time.time() for handle in driver.window_handles}

    while True:
        start_time = time.time()
        for index, handle in enumerate(driver.window_handles):
            memory_usage, memory_limit = check_container_memory("finance_selenium")
            if memory_usage and memory_limit:
                if memory_usage / memory_limit > 0.8:
                    send_warning_notification(f"Warning: Memory usage exceeds 80% of limit. / Memory Usage: {memory_usage:.2f} MB / {memory_limit:.2f} MB")

            driver.switch_to.window(handle)

            try:
                # Fetch premarket price
                premarket_element = driver.find_element(By.XPATH, system_info["premarket_xpath"])

                # Fetch market price
                element = driver.find_element(By.XPATH, system_info["market_xpath"])

                # If premarket price is not available, use market price
                stock_price = premarket_element.text if premarket_element.text else element.text

                # Write to InfluxDB
                ticker = list(ticker_urls.keys())[index]
                write_to_influxdb(ticker, stock_price)

            except Exception as e:
                send_error_notification_with_image(driver, e)
                raise e

            # Randomly reload the page
            current_time = time.time()

            if random.random() < 0.1 or (current_time - last_reload_times[handle]) > 3600:
                driver.refresh()
                last_reload_times[handle] = current_time

            time.sleep(0.3)

        # Wait for the next interval
        elapsed_time = time.time() - start_time
        remaining_time = WAIT_INTERVAL - elapsed_time

        if remaining_time > 0:
            time.sleep(remaining_time)

def check_container_memory(container_name):
    try:
        container = client.containers.get(container_name)
        stats = container.stats(stream=False)
        memory_usage = stats['memory_stats']['usage']
        memory_limit = stats['memory_stats']['limit']
        memory_usage_mb = memory_usage / 1024 / 1024
        memory_limit_mb = memory_limit / 1024 / 1024
        return memory_usage_mb, memory_limit_mb
    except Exception as e:
        send_error_notification(f"Error checking memory usage: {e}")
        return None, None

def get_elements_from_tabs():
    """Main function to get elements from tabs."""
    driver = initialize_driver()
    if not driver:
        send_error_notification("Failed to initialize Selenium WebDriver")
        return
    driver.set_page_load_timeout(60)
    driver.maximize_window()
    conn = get_database_connection()
    cur = conn.cursor()
    try:
        ticker_urls = fetch_ticker_urls(cur)
        system_info = fetch_system_info(cur)
        update_system_status(cur, "false")
        process_tabs(driver, cur, ticker_urls, system_info)
    except TimeoutException as e:
        send_error_notification_with_image(driver, e)
    except WebDriverException as e:
        send_error_notification_with_image(driver, e)
    finally:
        cur.close()
        conn.close()
        driver.quit()

if __name__ == "__main__":
    get_elements_from_tabs()
