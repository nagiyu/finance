# IAM ロール設定ガイド (GUI)

このドキュメントは、AWS マネジメントコンソールを使用して IAM ロールを作成する手順を説明します。

---

## 概要

AWS Batch POC 環境には、以下の 3 つの IAM ロールが必要です:

1. **Orchestrator Lambda 実行ロール**: Lambda がジョブを投入するために必要
2. **Batch Job ロール**: Batch ジョブが DynamoDB や Secrets Manager にアクセスするために必要
3. **Batch Task 実行ロール**: Fargate タスクが ECR からイメージを取得し、ログを書き込むために必要

---

## 1. Orchestrator Lambda 実行ロールの作成

### 手順

1. **IAM コンソールを開く**
   - AWS マネジメントコンソールにログイン
   - サービスから「IAM」を選択

2. **ロールの作成**
   - 左メニューから「ロール」を選択
   - 「ロールを作成」ボタンをクリック

3. **信頼されたエンティティの選択**
   - 信頼されたエンティティタイプ: **AWS のサービス**
   - ユースケース: **Lambda**
   - 「次へ」をクリック

4. **許可ポリシーの追加**
   - 検索ボックスに「AWSLambdaBasicExecutionRole」と入力
   - 「AWSLambdaBasicExecutionRole」にチェック
   - 「次へ」をクリック

5. **ロール名と確認**
   - ロール名: `finance-notification-poc-orchestrator-role`
   - 説明: `Orchestrator Lambda role for Finance Notification POC`
   - 「ロールを作成」をクリック

6. **カスタムポリシーの追加**
   - 作成したロール `finance-notification-poc-orchestrator-role` をクリック
   - 「許可」タブで「許可を追加」→「インラインポリシーを作成」を選択
   - JSON タブを選択し、以下のポリシーを貼り付け:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:Scan",
        "dynamodb:Query",
        "dynamodb:UpdateItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/Finance",
        "arn:aws:dynamodb:*:*:table/DevFinance"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "batch:SubmitJob",
        "batch:DescribeJobs"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:*:*:secret:*"
    }
  ]
}
```

   - ポリシー名: `finance-notification-poc-orchestrator-policy`
   - 「ポリシーの作成」をクリック

---

## 2. Batch Job ロールの作成

### 手順

1. **ロールの作成**
   - IAM コンソールで「ロール」→「ロールを作成」

2. **信頼されたエンティティの選択**
   - 信頼されたエンティティタイプ: **AWS のサービス**
   - ユースケース: **Elastic Container Service** → **Elastic Container Service Task**
   - 「次へ」をクリック

3. **許可ポリシーの追加**
   - この段階では何も選択せず「次へ」をクリック

4. **ロール名と確認**
   - ロール名: `finance-notification-poc-batch-job-role`
   - 説明: `Batch Job role for Finance Notification POC`
   - 「ロールを作成」をクリック

5. **カスタムポリシーの追加**
   - 作成したロール `finance-notification-poc-batch-job-role` をクリック
   - 「許可」タブで「許可を追加」→「インラインポリシーを作成」を選択
   - JSON タブを選択し、以下のポリシーを貼り付け:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/Finance",
        "arn:aws:dynamodb:*:*:table/DevFinance"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:*:*:secret:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

   - ポリシー名: `finance-notification-poc-batch-job-policy`
   - 「ポリシーの作成」をクリック

---

## 3. Batch Task 実行ロールの作成

### 手順

1. **ロールの作成**
   - IAM コンソールで「ロール」→「ロールを作成」

2. **信頼されたエンティティの選択**
   - 信頼されたエンティティタイプ: **AWS のサービス**
   - ユースケース: **Elastic Container Service** → **Elastic Container Service Task**
   - 「次へ」をクリック

3. **許可ポリシーの追加**
   - 検索ボックスに「AmazonECSTaskExecutionRolePolicy」と入力
   - 「AmazonECSTaskExecutionRolePolicy」にチェック
   - 「次へ」をクリック

4. **ロール名と確認**
   - ロール名: `finance-notification-poc-batch-execution-role`
   - 説明: `Batch Task Execution role for Finance Notification POC`
   - 「ロールを作成」をクリック

---

## 確認

すべてのロールが正しく作成されたことを確認します:

1. IAM コンソールの「ロール」ページで以下のロールが存在することを確認:
   - `finance-notification-poc-orchestrator-role`
   - `finance-notification-poc-batch-job-role`
   - `finance-notification-poc-batch-execution-role`

2. 各ロールの ARN をメモしておきます（後の手順で使用します）:
   - Orchestrator Role ARN: `arn:aws:iam::<ACCOUNT_ID>:role/finance-notification-poc-orchestrator-role`
   - Batch Job Role ARN: `arn:aws:iam::<ACCOUNT_ID>:role/finance-notification-poc-batch-job-role`
   - Batch Execution Role ARN: `arn:aws:iam::<ACCOUNT_ID>:role/finance-notification-poc-batch-execution-role`

---

## 次のステップ

IAM ロールの作成が完了したら、次は ECR リポジトリを作成します。

→ [ECR セットアップガイド](./ecr-setup-guide.md)

---

**作成日**: 2025年10月30日  
**バージョン**: 1.0
