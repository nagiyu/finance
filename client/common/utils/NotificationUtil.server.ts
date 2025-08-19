import { NextRequest, NextResponse } from 'next/server';

import NotificationUtil, { NotificationPayloadType } from '@common/utils/NotificationUtil';
import APIUtil from '@client-common/utils/APIUtil';

export { NotificationPayloadType };

export default class ClientNotificationUtil {
  public static async sendNotification(subscription: any, payload: NotificationPayloadType): Promise<NextResponse> {
    try {
      await NotificationUtil.sendNotification(subscription, payload);
      return APIUtil.ReturnSuccess();
    } catch (error: unknown) {
      console.error(error);
      return APIUtil.ReturnInternalServerError({ error: JSON.stringify(error) });
    }
  }
}
