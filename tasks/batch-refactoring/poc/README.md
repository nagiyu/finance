# AWS Batch POC 環境

このディレクトリには、Finance Notification システムの AWS Batch POC 環境の構築スクリプトとドキュメントが含まれています。

## 📁 ディレクトリ構成

```
poc/
├── scripts/               # AWS CLI セットアップスクリプト
│   ├── setup.sh          # メインセットアップスクリプト（全体）
│   ├── setup-vpc.sh      # VPC とネットワーク作成
│   ├── setup-iam-roles.sh    # IAM ロール作成
│   ├── setup-ecr.sh          # ECR リポジトリ作成
│   └── setup-batch.sh        # AWS Batch リソース作成
│
├── docs/                  # GUI セットアップドキュメント
│   ├── setup-guide.md        # 総合セットアップガイド
│   ├── vpc-setup-guide.md    # VPC セットアップガイド (GUI)
│   ├── iam-setup-guide.md    # IAM ロール設定ガイド (GUI)
│   ├── ecr-setup-guide.md    # ECR セットアップガイド (GUI)
│   └── batch-setup-guide.md  # AWS Batch セットアップガイド (GUI)
│
├── worker/                # Worker コンテナ実装
│   ├── Dockerfile            # Worker コンテナの Dockerfile
│   ├── index.ts              # Worker エントリーポイント
│   ├── package.json          # 依存関係
│   ├── tsconfig.json         # TypeScript 設定
│   └── build-and-push.sh     # ビルド&プッシュスクリプト
│
├── infrastructure/        # インフラストラクチャコード
│   └── orchestrator.ts       # Orchestrator Lambda サンプル実装
│
└── README.md             # このファイル
```

## 🚀 クイックスタート

### 前提条件

- AWS CLI (v2.x 以上)
- Docker
- Node.js 18.x 以上
- AWS アカウントと適切な権限

### AWS CLI を使用したセットアップ

すべてのリソースを自動的にセットアップ:

```bash
cd scripts
./setup.sh
```

### ステップバイステップのセットアップ

1. **VPC ネットワークの作成**
    ```bash
    cd scripts
    ./setup-vpc.sh
    ```

2. **IAM ロールの作成**
    ```bash
    ./setup-iam-roles.sh
    ```

3. **ECR リポジトリの作成**
    ```bash
    ./setup-ecr.sh
    ```

4. **AWS Batch 環境の作成**
    ```bash
    ./setup-batch.sh
    ```

5. **Worker コンテナのビルドとプッシュ**
    ```bash
    cd ../worker
    npm install
    ./build-and-push.sh
    ```

### AWS コンソール (GUI) を使用したセットアップ

GUI から手動でセットアップする場合は、以下のドキュメントを参照してください:

1. [セットアップガイド](./docs/setup-guide.md) - 全体の流れ
2. [VPC セットアップガイド](./docs/vpc-setup-guide.md)
3. [IAM ロール設定ガイド](./docs/iam-setup-guide.md)
4. [ECR セットアップガイド](./docs/ecr-setup-guide.md)
5. [AWS Batch セットアップガイド](./docs/batch-setup-guide.md)

## 📋 作成されるリソース

### VPC とネットワーク

- VPC: `finance-notification-poc-vpc` (10.0.0.0/16)
- インターネットゲートウェイ: `finance-notification-poc-igw`
- パブリックサブネット × 2 (異なるアベイラビリティゾーン)
- ルートテーブル: `finance-notification-poc-public-rt`
- セキュリティグループ: `finance-notification-poc-sg`

### IAM ロール

- `finance-notification-poc-orchestrator-role` - Orchestrator Lambda 実行ロール
- `finance-notification-poc-batch-job-role` - Batch Job ロール
- `finance-notification-poc-batch-execution-role` - Batch Task 実行ロール

### ECR リポジトリ

- `finance-notification-poc-worker` - Worker コンテナイメージ用

### AWS Batch リソース

- Compute Environment: `finance-notification-poc-compute-env` (Fargate Spot)
- Job Queue: `finance-notification-poc-job-queue`
- Job Definition: `finance-notification-poc-worker`

### CloudWatch Logs

- ロググループ: `/aws/batch/finance-notification-poc`

## 🧪 テスト

### テストジョブの実行

```bash
aws batch submit-job \
  --job-name test-job-$(date +%s) \
  --job-queue finance-notification-poc-job-queue \
  --job-definition finance-notification-poc-worker \
  --container-overrides '{"environment":[{"name":"NOTIFICATION_ID","value":"test-123"}]}' \
  --region ap-northeast-1
```

### ログの確認

```bash
# CloudWatch Logs でログを確認
aws logs tail /aws/batch/finance-notification-poc --follow --region ap-northeast-1
```

または AWS コンソールから確認:
1. CloudWatch コンソールを開く
2. ロググループ `/aws/batch/finance-notification-poc` を選択
3. ログストリームを確認

## 📖 ドキュメント

### セットアップガイド

- [総合セットアップガイド](./docs/setup-guide.md)
- [IAM ロール設定ガイド (GUI)](./docs/iam-setup-guide.md)
- [ECR セットアップガイド (GUI)](./docs/ecr-setup-guide.md)
- [AWS Batch セットアップガイド (GUI)](./docs/batch-setup-guide.md)

### プロジェクトドキュメント

- [要件定義書](../requirements.md)
- [技術調査結果](../technical-investigation.md)
- [TODO リスト](../todo.md)

## 🔍 トラブルシューティング

### ジョブが実行されない

1. Compute Environment のステータスを確認
2. Job Queue が有効になっているか確認
3. ECR にイメージがプッシュされているか確認
4. IAM ロールの権限を確認

### ログが出力されない

1. CloudWatch Logs グループが作成されているか確認
2. Batch Execution Role に CloudWatch Logs への書き込み権限があるか確認

### ECR プッシュが失敗する

1. ECR ログインを再実行
2. リポジトリが存在するか確認
3. リージョンが正しいか確認

詳細は [セットアップガイド](./docs/setup-guide.md) のトラブルシューティングセクションを参照してください。

## 🎯 次のステップ

POC 環境が正常に動作することを確認したら:

1. Worker 実装の詳細化
2. Orchestrator Lambda の実装
3. EventBridge ルールの作成
4. 監視とアラートの設定
5. 統合テストの実施

詳細は [../todo.md](../todo.md) を参照してください。

## 📝 注意事項

- **これは POC 環境です**: 本番環境への適用前に十分なテストを実施してください
- **コスト**: Fargate Spot を使用していますが、リソースを使用した分のコストが発生します
- **リソースの削除**: 不要になったリソースは削除してコストを抑えてください

## 📄 ライセンス

本プロジェクトは Apache License 2.0 および MIT License のデュアルライセンスです。

---

**作成日**: 2025年10月30日  
**バージョン**: 1.0
