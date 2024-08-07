import docker
import time
import random
import requests
import os
from urllib.parse import urlparse, urljoin
from urllib.robotparser import RobotFileParser
from selenium import webdriver
from selenium.common.exceptions import WebDriverException, TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.chrome.options import Options
import check_price
import influxdb_utils
from database import get_database_connection, fetch_ticker_urls, fetch_system_info, update_system_status
from notifications import send_warning_notification, send_error_notification, send_error_notification_with_image

# Constants
WAIT_INTERVAL = 30
MAX_RETRIES = 10
SELENIUM_REMOTE_URL = os.getenv('SELENIUM_REMOTE_URL', 'http://selenium:4444/wd/hub')

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

def process_tabs(driver, cursor, ticker_client, system_info):
    """Process each tab to fetch stock prices."""
    driver.get(system_info["login_url"])

    # Wait for the user to login
    last_reload_time = time.time()

    while True:
        cursor.execute("SELECT value FROM system_info WHERE key = 'status'")
        if cursor.fetchone()[0] == "true":
            break
        time.sleep(5)

        # Check if 3 minutes have passed since the last reload
        if time.time() - last_reload_time >= 180:
            driver.get(system_info["login_url"])
            last_reload_time = time.time()

    ticker_urls = {}

    # Process each tab
    last_reload_times = {handle: time.time() for handle in driver.window_handles}

    while True:
        start_time = time.time()

        # Fetch ticker URLs
        new_ticker_urls = fetch_ticker_urls(cursor)

        removed_tickers = set(ticker_urls.keys()) - set(new_ticker_urls.keys())

        for ticker in removed_tickers:
            driver.switch_to.window(list(ticker_urls.keys()).index(ticker))
            driver.close()

        added_tickers = set(new_ticker_urls.keys()) - set(ticker_urls.keys())

        for ticker in added_tickers:
            url = new_ticker_urls[ticker]
            if can_fetch(url):
                driver.execute_script("window.open('');")
                driver.switch_to.window(driver.window_handles[-1])
                driver.get(url)
                time.sleep(5)
            else:
                send_warning_notification(f"Fetching not allowed by robots.txt: {url}")

        ticker_urls = new_ticker_urls

        memory_usage, memory_limit = check_container_memory("finance_selenium")
        if memory_usage and memory_limit:
            if memory_usage / memory_limit > 0.8:
                send_warning_notification(f"Warning: Memory usage exceeds 80% of limit. / Memory Usage: {memory_usage:.2f} MB / {memory_limit:.2f} MB")

        for index, handle in enumerate(driver.window_handles):
            driver.switch_to.window(handle)

            # Check if the current URL is the login URL
            if driver.current_url == system_info["login_url"]:
                continue

            try:
                # Fetch premarket price
                premarket_element = driver.find_element(By.XPATH, system_info["premarket_xpath"])

                # Fetch market price
                element = driver.find_element(By.XPATH, system_info["market_xpath"])

                # If premarket price is not available, use market price
                stock_price = premarket_element.text if premarket_element.text else element.text

                # Write to InfluxDB
                ticker_id = list(ticker_urls.keys())[index]
                influxdb_utils.write_to_influxdb(ticker_client, ticker_id, stock_price)

            except Exception as e:
                send_error_notification_with_image(driver, e)
                raise e

            # Randomly reload the page
            current_time = time.time()

            if random.random() < 0.1 or (current_time - last_reload_times[handle]) > 3600:
                driver.refresh()
                last_reload_times[handle] = current_time

            time.sleep(0.3)

        check_price.check_price(cursor, ticker_client)

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

    driver.set_page_load_timeout(300)
    driver.set_script_timeout(300)
    driver.maximize_window()

    # Connect to PostgreSQL
    conn = get_database_connection()
    cur = conn.cursor()

    # Connect to InfluxDB
    ticker_client = influxdb_utils.create_influxdb_client()

    try:
        system_info = fetch_system_info(cur)
        update_system_status(cur, "false")
        process_tabs(driver, cur, ticker_client, system_info)
    except TimeoutException as e:
        send_error_notification_with_image(driver, e)
    except WebDriverException as e:
        send_error_notification_with_image(driver, e)
    except Exception as e:
        send_error_notification(str(e))
    finally:
        cur.close()
        conn.close()
        driver.quit()

if __name__ == "__main__":
    get_elements_from_tabs()
