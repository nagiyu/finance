import { NextRequest } from "next/server";

import NotificationUtil, { PayloadType } from '@client-common/utils/NotificationUtil.server';

// Finance-specific notification payload type that extends the base PayloadType
export interface NotificationPayloadType extends PayloadType {
  data?: {
    exchangeId?: string;
    tickerId?: string;
  };
}

export async function POST(request: NextRequest) {
  const { message, subscription } = await request.json();

  // Parse message data if it's a JSON string
  let messageData;
  let exchangeId;
  let tickerId;
  try {
    const parsed = JSON.parse(message);
    if (typeof parsed === 'object' && parsed.message) {
      messageData = parsed.message;
      exchangeId = parsed.exchangeId;
      tickerId = parsed.tickerId;
    } else {
      messageData = message;
    }
  } catch {
    // If parsing fails, use the message as-is
    messageData = message;
  }

  const payload: NotificationPayloadType = {
    title: "Finance",
    body: messageData,
    icon: "/logo.png",
    // Include custom data for the service worker
    data: {
      exchangeId,
      tickerId
    }
  };

  return NotificationUtil.sendNotification(subscription, payload);
}
