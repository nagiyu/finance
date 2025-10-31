/**
 * Finance Notification Worker (POC)
 * 
 * AWS Batch で実行される Worker コンテナのエントリーポイント
 * 1つの通知設定を処理し、条件チェックと通知送信を実行します
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

// 環境変数
const PROCESS_ENV = process.env.PROCESS_ENV || 'development';
const AWS_REGION = process.env.AWS_REGION || 'ap-northeast-1';
const NOTIFICATION_ID = process.env.NOTIFICATION_ID;

// AWS SDK v3 クライアントの設定
const ddbClient = new DynamoDBClient({ region: AWS_REGION });
const dynamodb = DynamoDBDocumentClient.from(ddbClient);
const secretsManager = new SecretsManagerClient({ region: AWS_REGION });

// ログユーティリティ
function log(level: string, message: string, data?: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    component: 'worker',
    notificationId: NOTIFICATION_ID,
    message,
    ...data
  };
  console.log(JSON.stringify(logEntry));
}

/**
 * メイン処理
 */
async function main() {
  const startTime = Date.now();
  
  log('INFO', 'Worker started', {
    processEnv: PROCESS_ENV,
    region: AWS_REGION,
    notificationId: NOTIFICATION_ID
  });

  try {
    // 1. パラメータの検証
    if (!NOTIFICATION_ID) {
      throw new Error('NOTIFICATION_ID environment variable is required');
    }

    // 2. 通知設定の取得（DynamoDB から）
    log('INFO', 'Fetching notification settings from DynamoDB');
    const notification = await getNotificationSettings(NOTIFICATION_ID);
    
    if (!notification) {
      throw new Error(`Notification not found: ${NOTIFICATION_ID}`);
    }

    log('INFO', 'Notification settings retrieved', {
      userId: notification.userId,
      tickerId: notification.tickerId
    });

    // 3. シークレットの取得
    // 注: 実際の実装では PROJECT_SECRET 環境変数から取得
    // const secrets = await getSecrets();

    // 4. 条件チェックと通知送信
    // 注: これは POC のスケルトン実装です
    // 実際の実装では FinanceNotificationService のロジックを使用します
    log('INFO', 'Processing notification logic');
    
    // TODO: 実際の条件チェックと通知送信ロジックを実装
    // - TradingView API で株価データを取得
    // - 条件を評価
    // - 条件が満たされた場合、Web Push 通知を送信
    // - DynamoDB の lastNotifiedAt を更新

    // 5. 処理完了
    const duration = Date.now() - startTime;
    log('INFO', 'Worker completed successfully', {
      duration_ms: duration
    });

    process.exit(0);
  } catch (error) {
    const duration = Date.now() - startTime;
    log('ERROR', 'Worker failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      duration_ms: duration
    });

    process.exit(1);
  }
}

/**
 * DynamoDB から通知設定を取得
 */
async function getNotificationSettings(notificationId: string) {
  const tableName = PROCESS_ENV === 'production' ? 'Finance' : 'DevFinance';
  
  try {
    const result = await dynamodb.send(new GetCommand({
      TableName: tableName,
      Key: { ID: notificationId, DataType: 'FinanceNotification' }
    }));

    return result.Item;
  } catch (error) {
    log('ERROR', 'Failed to get notification settings', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * Secrets Manager からシークレットを取得
 * 
 * @param secretName - シークレット名
 * @returns パースされたシークレット値
 * 
 * @example
 * ```typescript
 * // 将来の実装例:
 * const secrets = await getSecrets(process.env.PROJECT_SECRET);
 * ```
 */
export async function getSecrets(secretName?: string) {
  const name = secretName || process.env.PROJECT_SECRET;
  
  if (!name) {
    throw new Error('PROJECT_SECRET environment variable is required');
  }

  try {
    const result = await secretsManager.send(new GetSecretValueCommand({
      SecretId: name
    }));

    if (result.SecretString) {
      return JSON.parse(result.SecretString);
    }

    throw new Error('Secret value not found');
  } catch (error) {
    log('ERROR', 'Failed to get secrets', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

// プロセスの開始
main();
