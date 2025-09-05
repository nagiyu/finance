# Finance Server

Finance モジュールのサーバーサイド実装です。AWS Lambda関数として動作し、株価監視と通知機能を提供します。

## 概要

Finance Server は以下の機能を提供します：

- **定期株価監視**: Lambda関数による定期的な株価チェック
- **通知処理**: 条件達成時のプッシュ通知送信
- **API エンドポイント**: クライアントアプリケーションとの連携

## アーキテクチャ

### Lambda Function Structure

```
server/finance/
├── index.ts              # Main Lambda handler
├── package.json          # Dependencies and build scripts  
├── tsconfig.json         # TypeScript configuration
├── Dockerfile           # Container configuration
├── build.sh             # Build script
└── test-*.js            # Test files
```

## 主要コンポーネント

### Lambda Handler (`index.ts`)

メインのLambda関数ハンドラーです。

**機能:**
- 10分間の継続実行（60秒間隔でチェック）
- 株価通知サービスの実行
- エラーハンドリングと再試行
- AWS Secrets Manager からのクライアントURL取得

**実行フロー:**
1. AWS Secrets Manager から `CLIENT_BASE_URL` を取得
2. 通知エンドポイントURLを構築（`${baseUrl}/api/send-notification`）
3. 10分間（600秒）のループ実行
4. 1分間隔で `FinanceNotificationService` を実行
5. エラー発生時も継続実行を維持

```typescript
export const handler = async () => {
  const financeNotificationService = new FinanceNotificationService();
  const baseUrl = await SecretsManagerUtil.getSecretValue(process.env.PROJECT_SECRET!, 'CLIENT_BASE_URL');
  const notificationEndpoint = `${baseUrl}/api/send-notification`;
  
  // 10分間の継続実行
  const endTime = Date.now() + 10 * 60 * 1000;
  const checkInterval = 60 * 1000;
  
  while (Date.now() < endTime) {
    await financeNotificationService.notification(notificationEndpoint);
    await new Promise(resolve => setTimeout(resolve, checkInterval));
  }
};
```

## ビルドとデプロイ

### Build Process

esbuild を使用したバンドルとミニファイを実行します。

```bash
npm run build
```

**ビルド設定:**
- TypeScript → JavaScript変換
- バンドル化とミニファイ
- ソースマップ生成
- Node.js ES2020 ターゲット

### Docker Support

コンテナベースでの実行をサポートします。

```dockerfile
# Dockerfile での設定例
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]
```

### Dependencies

**Production Dependencies:**
- Finance Core Module (`@finance/*`)
- Common Module (`@common/*`)

**Development Dependencies:**
- `esbuild`: バンドラー
- `typescript`: TypeScript compiler
- `esbuild-plugin-tsconfig-paths`: パス解決

## 環境設定

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PROCESS_ENV` | 実行環境 | `production`, `development`, `local` |
| `PROJECT_SECRET` | AWS Secrets Manager シークレット名 | `finance/prod/secrets` |
| `AWS_REGION` | AWS リージョン | `ap-northeast-1` |

### AWS Secrets Manager

以下のシークレットが必要です：

```json
{
  "CLIENT_BASE_URL": "https://your-client-app.vercel.app"
}
```

### DynamoDB Tables

環境に応じたテーブルが必要です：
- **Production**: `Finance`
- **Development**: `DevFinance`

## 監視とログ

### CloudWatch Logs

Lambda関数の実行ログはCloudWatch Logsに出力されます。

**ログレベル:**
- `console.log()`: 実行状況
- `console.error()`: エラー情報

### 実行監視

Lambda関数は以下の指標で監視できます：
- 実行時間（最大10分）
- エラー率
- 同時実行数
- メモリ使用量

## テスト

### Unit Tests

Jest を使用したユニットテストが含まれています。

```bash
# テスト実行（設定済みの場合）
npm test
```

**テストファイル:**
- `test-financeutil.js`: FinanceUtil のテスト
- `test-eventbridge.js`: EventBridge連携テスト

## トラブルシューティング

### よくある問題

1. **TradingView API エラー**
   - ネットワーク接続を確認
   - APIレート制限をチェック

2. **DynamoDB アクセスエラー**
   - IAM ロールの権限を確認
   - テーブル名の設定を確認

3. **Secrets Manager エラー**
   - シークレット名の設定を確認
   - IAM権限でSecretsManager:GetSecretValueが許可されているか確認

### ログ例

```bash
# 正常実行
Starting stock price check cycle
Stock price check cycle completed

# エラー発生
Error in check cycle: Chart error: Market not found
Fatal error: Unable to retrieve secret
```

## パフォーマンス

### 最適化ポイント

- **メモリ設定**: 512MB推奨
- **タイムアウト**: 15分（Lambda最大値）
- **同時実行**: 10以下を推奨
- **Cold Start対策**: Provisioned Concurrency の検討

## セキュリティ

### IAM Permissions

Lambda実行ロールに以下の権限が必要：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Scan",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/Finance*"
    },
    {
      "Effect": "Allow", 
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:*:*:secret:finance/*"
    }
  ]
}
```

## 関連ドキュメント

- [Finance Module Overview](../README.md)
- [Client Documentation](../client/README.md)
- [Common Server Documentation](../../common/server/README.md)