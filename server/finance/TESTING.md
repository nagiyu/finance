# Getting Push Subscription for Testing

If you need to get a push subscription object for testing the server finance push notification functionality, you can use the following JavaScript code in the browser console of the client finance application:

## Browser Console Code

```javascript
// This code should be run in the browser console of the client finance app
async function getPushSubscription() {
  try {
    // Check if service worker and push manager are supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push messaging is not supported');
    }

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Get existing subscription or create new one
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Get VAPID public key from the app
      const response = await fetch('/api/notification');
      const { VAPID_PUBLIC_KEY } = await response.json();
      
      // Convert base64 key to Uint8Array
      function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding)
          .replace(/-/g, '+')
          .replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      }

      // Subscribe to push notifications
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    // Return the subscription object
    console.log('Subscription object:');
    console.log(JSON.stringify(subscription.toJSON(), null, 2));
    
    return subscription.toJSON();
  } catch (error) {
    console.error('Error getting push subscription:', error);
  }
}

// Run the function
getPushSubscription();
```

## Usage

1. Open the client finance application in your browser
2. Open browser developer tools (F12)
3. Go to the Console tab
4. Paste and run the code above
5. Copy the subscription object from the console output
6. Use this subscription object in your server finance API requests

## Example Output

The code will output a subscription object like this:
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/ABC123DEF456...",
  "keys": {
    "p256dh": "BEl62iUYgUivxIkv69yViA_-AqJrg4t4AUtqQg_xHKE...",
    "auth": "tBHItJI5svbpez7KI4CCXg"
  }
}
```

You can then use this in your server finance requests:
```json
{
  "message": "Test notification from server finance",
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/ABC123DEF456...",
    "keys": {
      "p256dh": "BEl62iUYgUivxIkv69yViA_-AqJrg4t4AUtqQg_xHKE...",
      "auth": "tBHItJI5svbpez7KI4CCXg"
    }
  }
}
```