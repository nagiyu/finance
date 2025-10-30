# AWS Batch POC 環境構築ガイド

このドキュメントは、AWS Batch を使用した Finance Notification システムの POC 環境を構築する手順を説明します。

## 目次

1. [概要](#概要)
2. [前提条件](#前提条件)
3. [AWS CLI を使用したセットアップ](#aws-cli-を使用したセットアップ)
4. [AWS コンソール (GUI) を使用したセットアップ](#aws-コンソール-gui-を使用したセットアップ)
5. [検証とテスト](#検証とテスト)
6. [トラブルシューティング](#トラブルシューティング)

---

## 概要

本 POC では、以下の AWS サービスを使用します:

- **AWS Batch**: バッチジョブの実行環境
- **Amazon ECR**: Docker イメージのレジストリ
- **AWS Lambda**: Orchestrator として動作
- **Amazon EventBridge**: 定期実行トリガー
- **IAM**: 権限管理
- **CloudWatch Logs**: ログ管理

### アーキテクチャ図

```
EventBridge (1分間隔)
    ↓
Orchestrator Lambda
    ↓
AWS Batch Job Queue
    ↓
Fargate Spot Compute Environment
    ↓
Worker Container (ECR)
    ↓
DynamoDB / TradingView API
```

---

## 前提条件

### 必須ツール

- AWS CLI (v2.x 以上)
- Docker (Worker コンテナのビルド用)
- Git

### AWS リソース

- AWS アカウント
- 適切な IAM 権限（以下のサービスへのアクセス）:
  - IAM (ロール作成)
  - ECR (リポジトリ作成)
  - AWS Batch (全リソース)
  - CloudWatch Logs
  - VPC, EC2 (サブネット、セキュリティグループの参照)

### 環境変数

以下の環境変数を設定してください:

```bash
export AWS_REGION=ap-northeast-1  # 使用するリージョン
export AWS_PROFILE=default        # AWS CLI プロファイル (オプション)
```

---

## AWS CLI を使用したセットアップ

### クイックスタート

すべてのリソースを自動的にセットアップする場合:

```bash
cd tasks/batch-refactoring/poc/scripts
./setup.sh
```

### ステップバイステップのセットアップ

個別にセットアップする場合は、以下の順序で実行してください:

#### 1. IAM ロールのセットアップ

```bash
./setup-iam-roles.sh
```

作成されるロール:
- `finance-notification-poc-orchestrator-role`: Orchestrator Lambda 用
- `finance-notification-poc-batch-job-role`: Batch Job 用
- `finance-notification-poc-batch-execution-role`: Batch Task 実行用

#### 2. ECR リポジトリのセットアップ

```bash
./setup-ecr.sh
```

作成されるリポジトリ:
- `finance-notification-poc-worker`: Worker コンテナイメージ用

#### 3. AWS Batch 環境のセットアップ

```bash
./setup-batch.sh
```

作成されるリソース:
- Compute Environment: `finance-notification-poc-compute-env` (Fargate Spot)
- Job Queue: `finance-notification-poc-job-queue`
- Job Definition: `finance-notification-poc-worker`

---

## AWS コンソール (GUI) を使用したセットアップ

AWS マネジメントコンソールから手動でセットアップする場合の手順です。

### 1. IAM ロールの作成

詳細は [docs/iam-setup-guide.md](./iam-setup-guide.md) を参照してください。

要約:
1. IAM コンソールを開く
2. 3 つのロールを作成:
   - Orchestrator Lambda 実行ロール
   - Batch Job ロール
   - Batch Task 実行ロール
3. 各ロールに適切なポリシーをアタッチ

### 2. ECR リポジトリの作成

詳細は [docs/ecr-setup-guide.md](./ecr-setup-guide.md) を参照してください。

要約:
1. ECR コンソールを開く
2. リポジトリを作成: `finance-notification-poc-worker`
3. イメージスキャンを有効化
4. ライフサイクルポリシーを設定

### 3. AWS Batch リソースの作成

詳細は [docs/batch-setup-guide.md](./batch-setup-guide.md) を参照してください。

要約:
1. AWS Batch コンソールを開く
2. Compute Environment を作成 (Fargate Spot)
3. Job Queue を作成
4. Job Definition を作成

---

## 検証とテスト

### 1. ECR にログイン

```bash
AWS_REGION=ap-northeast-1
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
```

### 2. Worker コンテナのビルドとプッシュ

```bash
cd ../worker
./build-and-push.sh
```

### 3. テストジョブの実行

```bash
aws batch submit-job \
  --job-name test-job-$(date +%s) \
  --job-queue finance-notification-poc-job-queue \
  --job-definition finance-notification-poc-worker \
  --container-overrides '{"environment":[{"name":"NOTIFICATION_ID","value":"test-123"}]}' \
  --region ap-northeast-1
```

### 4. ジョブステータスの確認

```bash
# ジョブ ID を取得
JOB_ID=<上記コマンドで返された jobId>

# ジョブステータスを確認
aws batch describe-jobs --jobs $JOB_ID --region ap-northeast-1
```

### 5. ログの確認

CloudWatch Logs でログを確認:

```bash
aws logs tail /aws/batch/finance-notification-poc --follow --region ap-northeast-1
```

または AWS コンソールから:
1. CloudWatch コンソールを開く
2. ロググループ `/aws/batch/finance-notification-poc` を選択
3. ログストリームを確認

---

## トラブルシューティング

### ジョブが RUNNABLE 状態で停止する

**原因**: Compute Environment が起動していない可能性があります。

**対処法**:
1. Compute Environment のステータスを確認
2. VPC とサブネットの設定を確認
3. Fargate の制限を確認

### ジョブが FAILED になる

**原因**: Worker コンテナのエラーまたは IAM 権限不足。

**対処法**:
1. CloudWatch Logs でエラーメッセージを確認
2. IAM ロールの権限を確認
3. ECR イメージが正しくプッシュされているか確認

### ECR へのプッシュが失敗する

**原因**: 認証エラーまたはリポジトリが存在しない。

**対処法**:
1. ECR ログインを再実行
2. リポジトリが存在するか確認: `aws ecr describe-repositories`
3. リージョンが正しいか確認

### Compute Environment が INVALID 状態になる

**原因**: VPC やサブネット設定の問題。

**対処法**:
1. サブネットが Fargate をサポートしているか確認
2. セキュリティグループのアウトバウンドルールを確認
3. NAT Gateway または Internet Gateway の設定を確認 (プライベートサブネットの場合)

---

## 次のステップ

POC 環境が正常に動作することを確認したら:

1. **Worker 実装の詳細化**: 実際の通知ロジックを実装
2. **Orchestrator Lambda の実装**: DynamoDB からの通知設定取得とフィルタリング
3. **EventBridge ルールの作成**: 定期実行トリガーの設定
4. **監視とアラートの設定**: CloudWatch Alarms の作成
5. **コスト分析**: 1週間の運用コスト測定

詳細は [../todo.md](../../todo.md) を参照してください。

---

## 参考リンク

- [AWS Batch User Guide](https://docs.aws.amazon.com/batch/latest/userguide/)
- [AWS Fargate on AWS Batch](https://docs.aws.amazon.com/batch/latest/userguide/fargate.html)
- [Amazon ECR User Guide](https://docs.aws.amazon.com/ecr/)
- [要件定義書](../../requirements.md)
- [技術調査結果](../../technical-investigation.md)

---

**作成日**: 2025年10月30日  
**バージョン**: 1.0
