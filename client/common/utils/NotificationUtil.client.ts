interface CustomSubscription extends PushSubscription {
  keys: {
    p256dh: string;
    auth: string;
  }
}

export default class NotificationUtil {
  public static getSubscription(): CustomSubscription | null {
    const subscriptionJson = localStorage.getItem('pushSubscription');
    return subscriptionJson ? JSON.parse(subscriptionJson) as CustomSubscription : null;
  }
}
