# main.py
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import requests
import os
from datetime import datetime
from influxdb import InfluxDBClient
import psycopg2

WAIT_INTERVAL = 30  # 30秒のインターバル

def can_fetch(url):
    # robots.txtの確認
    from urllib.parse import urlparse, urljoin
    parsed_url = urlparse(url)
    robots_url = urljoin(f"{parsed_url.scheme}://{parsed_url.netloc}", "/robots.txt")
    response = requests.get(robots_url)
    if response.status_code == 200:
        from urllib.robotparser import RobotFileParser
        rp = RobotFileParser()
        rp.parse(response.text.split('\n'))
        return rp.can_fetch("*", url)
    return False

def get_elements_from_tabs():
    options = Options()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')

    selenium_remote_url = os.getenv('SELENIUM_REMOTE_URL', 'http://selenium:4444/wd/hub')

    # リトライロジック
    max_retries = 10
    for _ in range(max_retries):
        try:
            driver = webdriver.Remote(command_executor=selenium_remote_url, options=options)
            break
        except Exception as e:
            print(f"Retrying connection to Selenium server: {e}")
            time.sleep(5)
    else:
        print("Failed to connect to the Selenium server after several retries.")
        return

    driver.maximize_window()

    try:
        # ティッカーとURLのリストを PsotgresSQL から取得する
        conn = psycopg2.connect(
            host="postgres",
            database="my_finance_manager_db",
            user="postgres",
            password="Password123!"
        )
        cur = conn.cursor()
        cur.execute("SELECT ticker_name, url FROM ticker_urls")
        rows = cur.fetchall()
        TICKER_URLS = {row[0]: row[1] for row in rows}

        # システム情報をキーバリュー形式で取得
        cur.execute("SELECT key, value FROM system_info")
        rows = cur.fetchall()
        SYSTEM_INFO = {row[0]: row[1] for row in rows}

        # ログイン画面を開く
        driver.get(SYSTEM_INFO["login_url"])

        # ticker_urls テーブルの status のレコードを false にする
        cur.execute("UPDATE system_info SET value = %s WHERE key = 'status'", ("false",))
        conn.commit()

        # ticker_urls テーブルの status のレコードが true になるまで待つ
        while True:
            cur.execute("SELECT value FROM system_info WHERE key = 'status'")
            rows = cur.fetchall()
            if rows[0][0] == "true":
                break
            time.sleep(5)

        # 各URLを新しいタブで開く
        for ticker, url in TICKER_URLS.items():
            if can_fetch(url):
                driver.execute_script("window.open('');")  # 新しいタブを開く
                driver.switch_to.window(driver.window_handles[-1])
                driver.get(url)

                time.sleep(5)
            else:
                print(f"Fetching not allowed by robots.txt: {url}")

        # 1つ目のタブはいらないので閉じる
        driver.switch_to.window(driver.window_handles[0])
        driver.close()

        while True:
            start_time = time.time()  # 処理開始時間を記録
            for index, handle in enumerate(driver.window_handles):
                driver.switch_to.window(handle)
                try:
                    # Premarket の値を取得
                    premarket_element = driver.find_element(By.XPATH, SYSTEM_INFO["premarket_xpath"])

                    # Market の値を取得
                    element = driver.find_element(By.XPATH, SYSTEM_INFO["market_xpath"])

                    # InfluxDB にデータを書き込む
                    ticker = list(TICKER_URLS.keys())[index]

                    # プレマーケットの値があればそれを取得、なければ通常の値を取得
                    stock_price = premarket_element.text if premarket_element.text else element.text
                    write_to_influxdb(ticker, stock_price)

                except Exception as e:
                    print(f"Error accessing element on URL: {driver.current_url}, Error: {e}")

                # 0.3秒待つ
                time.sleep(0.3)
            
            elapsed_time = time.time() - start_time  # 処理にかかった時間を計測
            remaining_time = WAIT_INTERVAL - elapsed_time
            
            if remaining_time > 0:
                time.sleep(remaining_time)

    finally:
        # PostgreSQL との接続を閉じる
        cur.close()
        conn.close()

        # ブラウザを閉じる
        driver.quit()

def write_to_influxdb(ticker, stock_price):
    client = InfluxDBClient(host='influxdb', port=8086, database='stock_prices')
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

if __name__ == "__main__":
    get_elements_from_tabs()
