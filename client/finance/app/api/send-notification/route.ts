import { NextRequest } from "next/server";

import ClientNotificationUtil, { NotificationPayloadType } from '@client-common/utils/NotificationUtil.server';

export async function POST(request: NextRequest) {
  const { message, subscription } = await request.json();

  const payload: NotificationPayloadType = {
    title: "Finance",
    body: message,
    icon: "/logo.png",
  };

  return ClientNotificationUtil.sendNotification(subscription, payload);
}
