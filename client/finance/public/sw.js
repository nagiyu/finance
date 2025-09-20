// サービスワーカーが「push」イベントを受け取ったときの処理
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/logo.png',
      badge: '/logo.png',
      vibrate: [100, 50, 100],
      data: data.data // Include the data field from the payload
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// 表示された通知がクリックされたときの処理
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  
  // Parse the notification data to get exchange and ticker information
  const notificationData = event.notification.data;
  let url = self.location.origin || 'http://localhost:3000';
  
  // If we have exchange and ticker data, add them as URL parameters
  if (notificationData && notificationData.exchangeId && notificationData.tickerId) {
    const params = new URLSearchParams();
    params.set('exchangeId', notificationData.exchangeId);
    params.set('tickerId', notificationData.tickerId);
    url += '/?' + params.toString();
  }
  
  event.waitUntil(
    clients.openWindow(url)
  );
});
