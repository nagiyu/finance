import SecretsManagerUtil from '@common/aws/SecretsManagerUtil';
import ErrorUtil from '@common/utils/ErrorUtil';

import FinanceNotificationService from '@finance/services/FinanceNotificationService';

export const handler = async () => {
  const errors: string[] = [];

  try {
    const financeNotificationService = new FinanceNotificationService();

    // Get client base URL from AWS Secrets Manager
    const baseUrl = await SecretsManagerUtil.getSecretValue(process.env.PROJECT_SECRET!, 'CLIENT_BASE_URL');
    const notificationEndpoint = `${baseUrl}/api/send-notification`;

    // Run for 10 minutes (600 seconds), checking every minute (60 seconds)
    const endTime = Date.now() + 10 * 60 * 1000; // 10 minutes from now
    const checkInterval = 60 * 1000; // 1 minute

    while (Date.now() < endTime) {
      try {
        console.log('Starting stock price check cycle');

        await financeNotificationService.notification(notificationEndpoint);

        console.log('Stock price check cycle completed');

        // Wait for next cycle (unless we're near the end time)
        const remainingTime = endTime - Date.now();
        if (remainingTime > checkInterval) {
          await new Promise(resolve => setTimeout(resolve, checkInterval));
        } else {
          break;
        }
      } catch (error) {
        errors.push(`Error in check cycle: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Continue with next cycle even if this one failed
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      }
    }

    console.log('Finance notification service completed');
  } catch (error) {
    if (error instanceof Error) {
      errors.push(`Fatal error: ${error.message}`);
    } else {
      errors.push('Fatal unknown error');
    }
  }

  if (errors.length > 0) {
    ErrorUtil.throwError(errors.join('; '));
  }
};
