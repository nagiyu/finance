# Data Model（日本語）

## エンティティ一覧

- ECRRepository (client, server)
    - name: string (例: finance-client, finance-server)
    - encryption: ECR のデフォルト
    - lifecyclePolicy: イメージ保持ルール（例: 最大タグ数）

- LambdaFunction (client, server)
    - name: string
    - imageUri: string (ECR イメージ URI: <account>.dkr.ecr.<region>.amazonaws.com/<repo>:<tag>)
    - memory: number (MB)
    - timeout: number (秒)
    - environment: key/value map
    - functionUrl: (client のみ) boolean/設定オブジェクト
    - cloudfrontDistributionId: (client の場合に作成される)

- CloudFrontDistribution
    - id: string
    - domainName: string
    - acmCertificateArn: string (us-east-1 の ACM を使用)
    - origin: Lambda Function URL / S3 等（ここでは Function URL を想定）

- EventBridgeSchedule (server)
    - name: string
    - scheduleExpression: string (例: rate(1 minute))
    - targetLambda: LambdaFunction reference

- IAMPolicy (common-lambda-policy)
    - name: string
    - document: JSON ポリシー（最小権限）

- IAMUser (github-actions, local-client, local-server)
    - userName: string
    - attachedPolicy: reference to IAMPolicy
    - accessKeys: optional (運用上は短期の使用か OIDC 推奨)

## バリデーションルール
- ECR 名、Lambda 名はリポジトリの命名規約に従う（英数字とハイフン、最大長等）
- imageUri は ECR リポジトリと同一アカウント/リージョンを指すこと
- scheduleExpression は EventBridge Scheduler の仕様に準拠

## 状態遷移
- 作成: CloudFormation StackCreate → ECR, IAM, Lambda, EventBridge, CloudFront を作成
- 更新: スタック更新でイメージタグ、環境変数、スケジュールを更新
- 削除: スタック削除で依存順にリソースを削除（CloudFront などはプロパゲーション時間に注意）

## 運用上の注意
- CloudFront の削除・再作成は時間がかかるため、本番切替は慎重に行う
- ACM は `us-east-1` に必要。証明書の発行状態は事前チェックを必須とする

