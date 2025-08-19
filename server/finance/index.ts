import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';

import NotificationUtil, { NotificationPayloadType } from '@common/utils/NotificationUtil';

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the request body to get message and subscription
    const body = event.body ? JSON.parse(event.body) : {};
    const { message, subscription } = body;

    if (!message || !subscription) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Both message and subscription are required'
        })
      };
    }

    // Create the notification payload
    const payload: NotificationPayloadType = {
      title: "Finance",
      body: message,
      icon: "/logo.png",
    };

    // Send the push notification
    await NotificationUtil.sendNotification(subscription, payload);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Push notification sent successfully'
      })
    };
  } catch (error: unknown) {
    console.error('Error sending push notification:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to send push notification',
        details: error instanceof Error ? error.message : String(error)
      })
    };
  }
};
