# AWS Batch セットアップガイド (GUI)

このドキュメントは、AWS マネジメントコンソールを使用して AWS Batch リソースを作成する手順を説明します。

---

## 概要

AWS Batch の環境構築には、以下の 3 つのリソースを順番に作成します:

1. **Compute Environment**: ジョブを実行するコンピューティングリソース
2. **Job Queue**: ジョブを待機・管理するキュー
3. **Job Definition**: ジョブの実行方法を定義

---

## 前提条件

以下のリソースが作成済みであることを確認してください:

- IAM ロール:
  - `finance-notification-poc-batch-job-role`
  - `finance-notification-poc-batch-execution-role`
- ECR リポジトリ:
  - `finance-notification-poc-worker` (イメージがプッシュ済み)

---

## 1. Compute Environment の作成

### 手順

1. **AWS Batch コンソールを開く**
   - AWS マネジメントコンソールにログイン
   - サービスから「Batch」を選択
   - リージョンが正しいことを確認（例: ap-northeast-1）

2. **Compute Environment の作成を開始**
   - 左メニューから「Compute environments」を選択
   - 「Create」ボタンをクリック

3. **オーケストレーションタイプの選択**
   - オーケストレーションタイプ: **AWS Batch**

4. **Compute Environment の設定**
   - 名前: `finance-notification-poc-compute-env`
   - サービスロール: **新しいサービスロールを作成** (自動で作成されます)

5. **インスタンス設定**
   - プロビジョニングモデル: **Fargate Spot**
   - 最大 vCPU: `4`

6. **ネットワーク設定**
   - VPC: デフォルト VPC または適切な VPC を選択
   - サブネット: 
     - パブリックサブネットを選択（インターネットゲートウェイ経由）
     - または、プライベートサブネット（NAT Gateway 経由）
   - セキュリティグループ: デフォルトセキュリティグループまたは適切なセキュリティグループ
     - アウトバウンドルールで HTTPS (443) が許可されていることを確認

7. **タグ（オプション）**
   - キー: `Environment`, 値: `POC`
   - キー: `Project`, 値: `FinanceNotification`

8. **Compute Environment の作成**
   - 「Create compute environment」ボタンをクリック
   - ステータスが **VALID** になるまで待機（数分かかる場合があります）

---

## 2. Job Queue の作成

### 手順

1. **Job Queue の作成を開始**
   - 左メニューから「Job queues」を選択
   - 「Create」ボタンをクリック

2. **オーケストレーションタイプの選択**
   - オーケストレーションタイプ: **AWS Batch**

3. **Job Queue の設定**
   - 名前: `finance-notification-poc-job-queue`
   - 優先度: `1`
   - ステート: **Enabled**

4. **Compute Environment の選択**
   - 「Connected compute environments」で「Select compute environments」をクリック
   - 作成した Compute Environment `finance-notification-poc-compute-env` を選択
   - Order: `1`

5. **タグ（オプション）**
   - 必要に応じてタグを追加

6. **Job Queue の作成**
   - 「Create job queue」ボタンをクリック

---

## 3. Job Definition の作成

### 手順

1. **Job Definition の作成を開始**
   - 左メニューから「Job definitions」を選択
   - 「Create」ボタンをクリック

2. **オーケストレーションタイプの選択**
   - オーケストレーションタイプ: **AWS Batch**

3. **基本設定**
   - 名前: `finance-notification-poc-worker`
   - プラットフォーム: **Fargate**

4. **コンテナ設定**
   - イメージ: ECR リポジトリ URI を入力
     - 形式: `<ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/finance-notification-poc-worker:latest`
     - 例: `123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/finance-notification-poc-worker:latest`
   
   - コマンド: 空欄のまま（Dockerfile の CMD を使用）
   
   - リソース割り当て:
     - vCPU: `0.25`
     - メモリ: `0.5 GB` (512 MB)
   
   - 実行ロール: `finance-notification-poc-batch-execution-role` を選択
   - ジョブロール: `finance-notification-poc-batch-job-role` を選択

5. **環境変数**
   - 以下の環境変数を追加:
     - 名前: `PROCESS_ENV`, 値: `development`
     - 名前: `AWS_REGION`, 値: `ap-northeast-1` (または使用するリージョン)

6. **ログ設定**
   - ログドライバー: **awslogs**
   - ログ設定:
     - awslogs-group: `/aws/batch/finance-notification-poc`
     - awslogs-region: `ap-northeast-1` (または使用するリージョン)
     - awslogs-stream-prefix: `worker`

   **注意**: CloudWatch Logs グループを事前に作成しておく必要があります:
   ```bash
   aws logs create-log-group \
     --log-group-name /aws/batch/finance-notification-poc \
     --region ap-northeast-1
   ```

7. **リトライ戦略**
   - リトライ試行回数: `3`
   - 評価終了条件:
     - 「Add evaluate on exit」をクリック
     - 条件 1:
       - アクション: **Retry**
       - Status reason: `Task failed to start`
     - 条件 2:
       - アクション: **Exit**
       - On reason: `*` (すべて)

8. **タグ（オプション）**
   - 必要に応じてタグを追加

9. **Job Definition の作成**
   - 「Create job definition」ボタンをクリック

---

## CloudWatch Logs グループの作成

Job Definition で指定したログ出力先の CloudWatch Logs グループを作成します。

### 手順

1. **CloudWatch コンソールを開く**
   - サービスから「CloudWatch」を選択

2. **ロググループの作成**
   - 左メニューから「ログ」→「ロググループ」を選択
   - 「ロググループを作成」ボタンをクリック

3. **ロググループの設定**
   - ロググループ名: `/aws/batch/finance-notification-poc`
   - 保持設定: `1 week` (7日間) または必要に応じて変更
   - KMS キー: デフォルト（暗号化なし）または必要に応じて設定

4. **ロググループの作成**
   - 「ロググループを作成」ボタンをクリック

---

## 動作確認

すべてのリソースが正しく作成されたことを確認します。

### 1. リソースの確認

AWS Batch コンソールで以下を確認:

- **Compute Environment**: `finance-notification-poc-compute-env` のステータスが **VALID**
- **Job Queue**: `finance-notification-poc-job-queue` のステータスが **VALID** かつ **ENABLED**
- **Job Definition**: `finance-notification-poc-worker:1` が存在

### 2. テストジョブの実行

1. **ジョブの投入**
   - 左メニューから「Jobs」を選択
   - 「Submit new job」ボタンをクリック

2. **ジョブ設定**
   - 名前: `test-job-1`
   - Job definition: `finance-notification-poc-worker:1` を選択
   - Job queue: `finance-notification-poc-job-queue` を選択

3. **環境変数の上書き（オプション）**
   - 「Container overrides」セクションで環境変数を追加:
     - 名前: `NOTIFICATION_ID`, 値: `test-123`

4. **ジョブの投入**
   - 「Submit」ボタンをクリック

5. **ジョブステータスの確認**
   - ジョブリストでステータスを確認
   - SUBMITTED → PENDING → RUNNABLE → RUNNING → SUCCEEDED の順に遷移

6. **ログの確認**
   - CloudWatch Logs コンソールを開く
   - ロググループ `/aws/batch/finance-notification-poc` を選択
   - ログストリームでジョブのログを確認

---

## トラブルシューティング

### ジョブが RUNNABLE のまま進まない

**原因**: Compute Environment が起動していない、またはリソース不足

**対処法**:
1. Compute Environment のステータスを確認
2. 最大 vCPU を増やす
3. VPC とサブネットの設定を確認

### ジョブが FAILED になる

**原因**: コンテナのエラーまたは IAM 権限不足

**対処法**:
1. CloudWatch Logs でエラーメッセージを確認
2. ECR イメージが正しくプッシュされているか確認
3. IAM ロールの権限を確認

### イメージが見つからない

**エラー**: `CannotPullContainerError`

**対処法**:
1. ECR リポジトリ URI が正しいか確認
2. ECR にイメージがプッシュされているか確認
3. Batch Execution Role に ECR アクセス権限があるか確認

---

## 次のステップ

AWS Batch 環境の構築が完了したら:

1. Worker コンテナの実装を完成させる
2. Orchestrator Lambda を実装してデプロイ
3. EventBridge ルールを作成して定期実行を設定
4. 監視とアラートを設定

→ [セットアップガイド](./setup-guide.md) に戻る

---

**作成日**: 2025年10月30日  
**バージョン**: 1.0
