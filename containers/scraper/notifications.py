import time
import requests

def send_warning_notification(message):
    """Send error notification with a screenshot."""
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
