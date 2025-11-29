# CloudFormation テンプレート

本ディレクトリは Finance アプリケーションの AWS インフラストラクチャを CloudFormation で管理するためのテンプレート群を格納しています。

## 目的

本リポジトリでは、以下の AWS リソースを CloudFormation で一元管理することで、インフラの自動プロビジョニングとデプロイを実現します：

- **ECR（Elastic Container Registry）**: client および server 用のコンテナイメージリポジトリ
- **Lambda 関数**: ECR イメージを参照する client および server の Lambda 関数
- **IAM ロール・ポリシー**: Lambda 実行ロール、GitHub Actions 用ユーザー、ローカル開発者用ユーザー
- **EventBridge Scheduler**: server（バッチ）Lambda の定期実行
- **CloudFront**: client Lambda の外部公開用ディストリビューション

## ディレクトリ構成

```
infra/cloudformation/
├── README.md                           # 本ファイル
├── base-stack.yml                      # 基本スタック（IAM ロール等の共通リソース）
└── aws-resources/                      # 個別リソーステンプレート（予定）
    ├── ecr-client.yaml                 # client 用 ECR リポジトリ
    ├── ecr-server.yaml                 # server 用 ECR リポジトリ
    ├── common-lambda-policy.yaml       # Lambda 共通ポリシー
    ├── main-stack.yaml                 # 親スタック
    ├── iam-users.yaml                  # IAM ユーザー定義
    └── local-user-policies.yaml        # ローカル開発者用ポリシー
```

## 対象ファイル一覧

| ファイル名 | 説明 | ステータス |
|-----------|------|-----------|
| `base-stack.yml` | Lambda 実行ロールの定義（client/server 用） | 作成済み |
| `aws-resources/ecr-client.yaml` | client 用 ECR リポジトリ | 未作成 |
| `aws-resources/ecr-server.yaml` | server 用 ECR リポジトリ | 未作成 |
| `aws-resources/common-lambda-policy.yaml` | Lambda 共通 IAM ポリシー | 未作成 |
| `aws-resources/main-stack.yaml` | メインスタック（他スタックの参照） | 未作成 |
| `aws-resources/iam-users.yaml` | IAM ユーザー定義 | 未作成 |
| `aws-resources/local-user-policies.yaml` | ローカル開発者用ポリシー | 未作成 |
| `lambda-client.yaml` | client 用 Lambda 関数 | 未作成 |
| `lambda-server.yaml` | server 用 Lambda 関数 | 未作成 |
| `eventbridge-server.yaml` | EventBridge Scheduler | 未作成 |
| `cloudfront-client.yaml` | CloudFront Distribution | 未作成 |

## デプロイ手順

### 前提条件

- AWS CLI がインストールされ、適切な認証情報が設定されていること
- CloudFormation スタック作成、ECR、Lambda、CloudFront、IAM の操作権限があること
- Docker がインストールされていること（イメージビルド時）

### 1. 基本スタックのデプロイ

```bash
# 開発環境
aws cloudformation deploy \
  --stack-name finance-base-development \
  --template-file infra/cloudformation/base-stack.yml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides Environment=development

# 本番環境
aws cloudformation deploy \
  --stack-name finance-base-production \
  --template-file infra/cloudformation/base-stack.yml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides Environment=production
```

### 2. スタック状態の確認

```bash
# スタックの状態を確認
aws cloudformation describe-stacks --stack-name finance-base-development

# スタックの出力値を確認
aws cloudformation describe-stacks \
  --stack-name finance-base-development \
  --query 'Stacks[0].Outputs'
```

### 3. スタックの更新

テンプレートを変更した後、同じコマンドで更新できます：

```bash
aws cloudformation deploy \
  --stack-name finance-base-development \
  --template-file infra/cloudformation/base-stack.yml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides Environment=development
```

### 4. 変更セットの確認（推奨）

本番環境への適用前に変更内容を確認することを推奨します：

```bash
# 変更セットを作成
aws cloudformation create-change-set \
  --stack-name finance-base-production \
  --template-file infra/cloudformation/base-stack.yml \
  --change-set-name my-changes \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides Environment=production

# 変更内容を確認
aws cloudformation describe-change-set \
  --stack-name finance-base-production \
  --change-set-name my-changes

# 変更を適用
aws cloudformation execute-change-set \
  --stack-name finance-base-production \
  --change-set-name my-changes
```

## 注意事項

### ACM 証明書とリージョンについて

CloudFront で使用する ACM 証明書は **us-east-1（バージニア北部）リージョン** に存在する必要があります。

- 既存の ACM 証明書が ap-northeast-1 などの他リージョンにある場合、us-east-1 に同等の証明書を追加発行する必要があります
- CloudFront テンプレート（`cloudfront-client.yaml`）では、us-east-1 の ACM 証明書 ARN をパラメータとして受け取ります
- 証明書の DNS 検証は事前に完了している必要があります

```bash
# us-east-1 で ACM 証明書を確認
aws acm list-certificates --region us-east-1

# 証明書の詳細を確認
aws acm describe-certificate \
  --region us-east-1 \
  --certificate-arn arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID
```

### IAM 権限について

CloudFormation でスタックをデプロイするには、以下の権限が必要です：

- `cloudformation:*` - スタック操作
- `iam:*` - ロール・ポリシー作成（`CAPABILITY_NAMED_IAM` 使用時）
- `lambda:*` - Lambda 関数操作
- `ecr:*` - ECR リポジトリ操作
- `cloudfront:*` - CloudFront 操作
- `events:*` - EventBridge 操作
- `logs:*` - CloudWatch Logs 操作

**注意**: 本番環境では最小権限の原則に従い、必要最低限の権限のみを付与してください。

### スタックの削除と再作成

#### 削除手順

```bash
# スタックの削除
aws cloudformation delete-stack --stack-name finance-base-development

# 削除完了を待機
aws cloudformation wait stack-delete-complete --stack-name finance-base-development
```

#### 削除時の注意点

1. **依存関係のあるリソース**: 他のスタックから参照されているリソース（Export 値）がある場合、削除に失敗します。依存スタックを先に削除してください。

2. **ECR リポジトリ**: イメージが含まれている ECR リポジトリは削除できません。事前にイメージを削除するか、`RetentionPolicy: Delete` と `EmptyOnDelete: true` をテンプレートに設定してください。

3. **S3 バケット**: オブジェクトが含まれている S3 バケットは削除できません。事前にバケットを空にしてください。

4. **CloudFront Distribution**: 削除に時間がかかる場合があります（最大15分程度）。

#### 再作成手順

削除完了後、デプロイ手順に従って再度スタックを作成してください。

```bash
# 削除を確認
aws cloudformation describe-stacks --stack-name finance-base-development
# ResourceNotFoundException が返れば削除完了

# 再作成
aws cloudformation deploy \
  --stack-name finance-base-development \
  --template-file infra/cloudformation/base-stack.yml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides Environment=development
```

### トラブルシューティング

#### スタック作成/更新が失敗した場合

```bash
# イベントログを確認
aws cloudformation describe-stack-events \
  --stack-name finance-base-development \
  --query 'StackEvents[?ResourceStatus==`CREATE_FAILED` || ResourceStatus==`UPDATE_FAILED`]'
```

#### ロールバックが発生した場合

`ROLLBACK_COMPLETE` 状態のスタックは更新できません。削除して再作成してください。

```bash
# スタック状態を確認
aws cloudformation describe-stacks \
  --stack-name finance-base-development \
  --query 'Stacks[0].StackStatus'
```

## CI/CD 連携

GitHub Actions からのデプロイは `.github/workflows/deploy-infra.yml` で管理されます（別途作成予定）。

CI 経由でのデプロイ手順については、[quickstart.md](../../specs/001-automate-aws-resources/quickstart.md) を参照してください。

## 関連ドキュメント

- [specs/001-automate-aws-resources/tasks.md](../../specs/001-automate-aws-resources/tasks.md) - タスク一覧
- [specs/001-automate-aws-resources/quickstart.md](../../specs/001-automate-aws-resources/quickstart.md) - クイックスタートガイド
- [specs/001-automate-aws-resources/spec.md](../../specs/001-automate-aws-resources/spec.md) - 仕様書
