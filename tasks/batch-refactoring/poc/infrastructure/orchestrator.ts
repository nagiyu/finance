/**
 * Orchestrator Lambda (POC)
 * 
 * DynamoDB から通知設定を取得し、頻度フィルタリングを行い、
 * AWS Batch にジョブを投入します
 */

import { Batch, DynamoDB } from 'aws-sdk';

// 環境変数
const PROCESS_ENV = process.env.PROCESS_ENV || 'development';
const AWS_REGION = process.env.AWS_REGION || 'ap-northeast-1';
const JOB_QUEUE_NAME = 'finance-notification-poc-job-queue';
const JOB_DEFINITION_NAME = 'finance-notification-poc-worker';

// AWS SDK の設定
const batch = new Batch({ region: AWS_REGION });
const dynamodb = new DynamoDB.DocumentClient({ region: AWS_REGION });

// ログユーティリティ
function log(level: string, message: string, data?: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    component: 'orchestrator',
    message,
    ...data
  };
  console.log(JSON.stringify(logEntry));
}

/**
 * Lambda ハンドラー
 */
export const handler = async (event: any) => {
  const startTime = Date.now();

  log('INFO', 'Orchestrator started', {
    processEnv: PROCESS_ENV,
    region: AWS_REGION
  });

  try {
    // 1. DynamoDB から通知設定を取得
    log('INFO', 'Fetching notification settings from DynamoDB');
    const notifications = await getNotificationSettings();

    log('INFO', 'Notification settings retrieved', {
      totalCount: notifications.length
    });

    // 2. 頻度フィルタリング
    // 注: これは POC の簡易実装です
    // 実際の実装では、現在時刻と頻度設定を考慮してフィルタリングします
    const filteredNotifications = filterNotifications(notifications);

    log('INFO', 'Notifications filtered', {
      filteredCount: filteredNotifications.length
    });

    // 3. AWS Batch にジョブを投入
    if (filteredNotifications.length === 0) {
      log('INFO', 'No notifications to process');
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'No notifications to process',
          submittedJobs: 0
        })
      };
    }

    log('INFO', 'Submitting jobs to AWS Batch', {
      jobCount: filteredNotifications.length
    });

    const jobSubmissions = await submitBatchJobs(filteredNotifications);

    // 4. 結果の集計
    const successCount = jobSubmissions.filter(r => r.status === 'fulfilled').length;
    const failureCount = jobSubmissions.filter(r => r.status === 'rejected').length;

    const duration = Date.now() - startTime;

    log('INFO', 'Orchestrator completed', {
      duration_ms: duration,
      totalNotifications: notifications.length,
      filteredNotifications: filteredNotifications.length,
      successfulJobs: successCount,
      failedJobs: failureCount
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Jobs submitted successfully',
        submittedJobs: successCount,
        failedJobs: failureCount,
        duration_ms: duration
      })
    };
  } catch (error) {
    const duration = Date.now() - startTime;

    log('ERROR', 'Orchestrator failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      duration_ms: duration
    });

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Orchestrator failed',
        error: error instanceof Error ? error.message : String(error)
      })
    };
  }
};

/**
 * DynamoDB から通知設定を取得
 */
async function getNotificationSettings() {
  const tableName = PROCESS_ENV === 'production' ? 'Finance' : 'DevFinance';

  try {
    const result = await dynamodb.scan({
      TableName: `${tableName}FinanceNotification`
    }).promise();

    return result.Items || [];
  } catch (error) {
    log('ERROR', 'Failed to scan DynamoDB', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * 頻度ベースのフィルタリング
 * 
 * 注: これは POC の簡易実装です
 * 実際の実装では、以下を考慮する必要があります:
 * - 現在時刻と頻度設定（1分毎、10分毎、1時間毎）
 * - 最終通知時刻（lastNotifiedAt）
 * - 取引所の開場時間
 */
function filterNotifications(notifications: any[]) {
  // POC では全通知を処理対象とする
  // 実際の実装では頻度チェックロジックを追加
  return notifications.filter(notification => {
    // TODO: 頻度チェックロジックの実装
    // 例: notification.frequency === 'MINUTE_LEVEL'
    return true;
  });
}

/**
 * AWS Batch にジョブを投入
 */
async function submitBatchJobs(notifications: any[]) {
  const jobPromises = notifications.map(notification => {
    const jobName = `notification-${notification.id}-${Date.now()}`;

    return batch.submitJob({
      jobName,
      jobQueue: JOB_QUEUE_NAME,
      jobDefinition: JOB_DEFINITION_NAME,
      containerOverrides: {
        environment: [
          {
            name: 'NOTIFICATION_ID',
            value: notification.id
          },
          {
            name: 'USER_ID',
            value: notification.userId
          }
        ]
      }
    }).promise()
      .then(result => {
        log('INFO', 'Job submitted', {
          jobName,
          jobId: result.jobId,
          notificationId: notification.id
        });
        return { status: 'fulfilled' as const, jobId: result.jobId };
      })
      .catch(error => {
        log('ERROR', 'Failed to submit job', {
          jobName,
          notificationId: notification.id,
          error: error instanceof Error ? error.message : String(error)
        });
        return { status: 'rejected' as const, error };
      });
  });

  return Promise.all(jobPromises);
}
