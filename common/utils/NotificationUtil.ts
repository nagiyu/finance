import webpush from 'web-push';
import SecretsManagerUtil from '@common/aws/SecretsManagerUtil';

export interface NotificationPayloadType {
  title: string;
  body: string;
  icon?: string;
}

export default class NotificationUtil {
  public static async sendNotification(subscription: any, payload: NotificationPayloadType): Promise<void> {
    if (!subscription) {
      throw new Error('No subscription provided');
    }

    const VAPID_PUBLIC_KEY = await SecretsManagerUtil.getSecretValue(process.env.PROJECT_SECRET!, 'VAPID_PUBLIC_KEY');
    const VAPID_PRIVATE_KEY = await SecretsManagerUtil.getSecretValue(process.env.PROJECT_SECRET!, 'VAPID_PRIVATE_KEY');
    const VAPID_SUBJECT = `mailto:${await SecretsManagerUtil.getSecretValue(process.env.PROJECT_SECRET!, 'VAPID_SUBJECT')}`;

    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    await webpush.sendNotification(subscription, JSON.stringify(payload));
  }
}