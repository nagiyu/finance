# Server Finance Push Notification API

The server finance Lambda function now supports sending push notifications to client finance applications.

## API Endpoint

**Method**: POST  
**Content-Type**: application/json

## Request Body

```json
{
  "message": "Your notification message text",
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

### Parameters

- **message** (string, required): The notification message text that will be displayed to the user
- **subscription** (object, required): The push subscription object obtained from the client's service worker registration

### Subscription Object

The subscription object should contain:
- **endpoint** (string): The push service endpoint URL
- **keys** (object): Encryption keys for the subscription
  - **p256dh** (string): The public key for encryption
  - **auth** (string): The authentication secret

## Response Codes

- **200**: Notification sent successfully
- **400**: Missing required parameters (message or subscription)
- **500**: Internal server error (e.g., invalid subscription, VAPID configuration issues)

## Example Usage

### Successful Request
```http
POST /your-lambda-endpoint
Content-Type: application/json

{
  "message": "Your account balance has been updated",
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/ABC123...",
    "keys": {
      "p256dh": "BEl62iUYgUivxIkv69yViA_-AqJrg4t4AUtqQg_xHKE...",
      "auth": "tBHItJI5svbpez7KI4CCXg"
    }
  }
}
```

**Response**:
```json
{
  "message": "Push notification sent successfully"
}
```

### Error Response (Missing Parameters)
```http
POST /your-lambda-endpoint
Content-Type: application/json

{
  "message": "Test notification"
}
```

**Response**:
```json
{
  "error": "Both message and subscription are required"
}
```

## Technical Details

- Uses the same VAPID configuration as the client finance application
- Notifications appear with title "Finance" and icon "/logo.png"
- Requires AWS Secrets Manager access for VAPID keys
- Built on the shared `NotificationUtil` from the common utilities

## Environment Requirements

The Lambda function requires the following environment variables:
- `PROJECT_SECRET`: AWS Secrets Manager secret name containing VAPID keys
- `PROJECT_AWS_REGION`: AWS region for Secrets Manager
- AWS IAM permissions to read from Secrets Manager