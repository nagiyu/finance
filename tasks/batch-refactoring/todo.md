# バッチ処理リファクタリング TODO

本ドキュメントは、[requirements.md](./requirements.md) に基づいたバッチ処理リファクタリングの実装タスクリストです。

**重要な変更点:**
- AWS Batch ベースのアーキテクチャから EventBridge + ECS ベースのシンプルな構成に変更
- Orchestrator Lambda は不要（EventBridge が直接 ECS タスクを起動）
- ジョブ分散ではなく、既存 Lambda の処理をそのまま ECS タスクで実行

---

## フェーズ1: ECS 環境構築と実装 (1-2週間)

### Week 1: インフラ構築

- [ ] ECS 環境の構築
    - [ ] ECS クラスターの作成 (Fargate)
    - [ ] タスク定義の作成
        - [ ] CPU: 0.25 vCPU, Memory: 512MB (初期設定)
        - [ ] Fargate Spot の設定
        - [ ] 環境変数の設定 (PROCESS_ENV, PROJECT_SECRET, EXECUTION_FREQUENCY)
    - [ ] CloudWatch Logs グループの作成

- [ ] ECR リポジトリの作成
    - [ ] リポジトリ作成 (finance-batch-processor)
    - [ ] ライフサイクルポリシーの設定

- [ ] IAM ロール・ポリシーの設定
    - [ ] ECS タスク実行ロール作成
        - [ ] ECR アクセス権限 (イメージ取得)
        - [ ] CloudWatch Logs 書き込み権限
    - [ ] ECS タスクロール作成
        - [ ] DynamoDB アクセス権限 (GetItem, Scan, Query, UpdateItem)
        - [ ] Secrets Manager アクセス権限 (GetSecretValue)
        - [ ] CloudWatch Logs 書き込み権限

- [ ] EventBridge スケジュール設定
    - [ ] 1分毎のルール作成
        - [ ] ECS タスク起動設定
        - [ ] 環境変数: EXECUTION_FREQUENCY=MINUTE
    - [ ] 10分毎のルール作成
        - [ ] ECS タスク起動設定
        - [ ] 環境変数: EXECUTION_FREQUENCY=TEN_MINUTES
    - [ ] 1時間毎のルール作成
        - [ ] ECS タスク起動設定
        - [ ] 環境変数: EXECUTION_FREQUENCY=HOUR
    - [ ] 取引開始時のルール作成
        - [ ] ECS タスク起動設定
        - [ ] 環境変数: EXECUTION_FREQUENCY=MARKET_OPEN

- [ ] Infrastructure as Code (Terraform/CloudFormation)
    - [ ] ECS クラスター・タスク定義のコード化
    - [ ] ECR リポジトリのコード化
    - [ ] IAM ロール・ポリシーのコード化
    - [ ] EventBridge ルールのコード化
    - [ ] VPC・セキュリティグループの設定 (デフォルト VPC 利用 or 新規作成)

### Week 2: コンテナ実装とテスト

- [ ] Docker コンテナの実装
    - [ ] 既存 Lambda コード (server/finance) のコンテナ化
        - [ ] エントリーポイントの作成 (環境変数から頻度を取得)
        - [ ] 既存の FinanceNotificationService をそのまま利用
        - [ ] 頻度フィルタリングロジックの実装
    - [ ] Dockerfile 作成
        - [ ] Node.js 18 Alpine ベースイメージ
        - [ ] マルチステージビルド (依存関係インストール → ビルド → 実行)
        - [ ] 依存関係インストール (finance, common モジュール)
        - [ ] TypeScript ビルド (esbuild)
    - [ ] .dockerignore 作成
    - [ ] ビルドスクリプト作成 (build-and-push.sh)
    - [ ] ローカルビルドテスト

- [ ] ECR へのプッシュ
    - [ ] 初回イメージプッシュ
    - [ ] イメージタグ戦略の決定 (latest, git commit hash など)

- [ ] 統合テスト
    - [ ] エンドツーエンドテスト
        - [ ] 各頻度 (1分/10分/1時間) で ECS タスク起動確認
        - [ ] 通知設定の取得と処理確認
        - [ ] 通知送信の確認
        - [ ] DynamoDB 更新の確認
    - [ ] エラーシナリオテスト
        - [ ] TradingView API エラー時の挙動確認
        - [ ] DynamoDB エラー時の挙動確認
        - [ ] タスク失敗時の CloudWatch Logs 確認
    - [ ] パフォーマンステスト
        - [ ] タスク実行時間の測定
        - [ ] CPU/メモリ使用率の確認
        - [ ] Fargate Spot 起動時間の測定

- [ ] 監視・ログ設定
    - [ ] CloudWatch Logs の確認
        - [ ] ログ出力形式の確認
        - [ ] ログ保持期間の設定
    - [ ] CloudWatch Metrics 設定
        - [ ] タスク起動回数
        - [ ] タスク実行時間
        - [ ] タスク失敗回数
        - [ ] CPU/メモリ使用率
    - [ ] CloudWatch Alarms 作成
        - [ ] タスク失敗アラート
        - [ ] 実行時間超過アラート (> 20分)
        - [ ] エラー率アラート (> 5%)
    - [ ] CloudWatch Dashboards 作成 (基本版)
        - [ ] タスク実行状況
        - [ ] リソース使用状況
        - [ ] エラー発生状況

- [ ] コスト測定
    - [ ] 1週間の運用コスト記録
    - [ ] Fargate Spot 中断頻度の確認
    - [ ] タスクあたりのコスト算出
    - [ ] Lambda との比較

- [ ] ドキュメント作成
    - [ ] セットアップ手順書
    - [ ] デプロイ手順書
    - [ ] トラブルシューティングガイド
    - [ ] 運用ガイド

---

## フェーズ2: 段階的移行 (1-2週間)

### Week 1: 並行運用開始

- [ ] 並行運用の準備
    - [ ] 新システム (ECS) の本番環境デプロイ
    - [ ] 旧システム (Lambda) の継続運用
    - [ ] 両システムのメトリクス比較設定

- [ ] 動作確認
    - [ ] 両システムで同じ通知設定を処理
    - [ ] 結果の比較
        - [ ] 処理時間
        - [ ] 通知送信成功率
        - [ ] エラー率
    - [ ] 問題の特定と修正

### Week 2: 完全移行

- [ ] 旧システムの停止準備
    - [ ] 最終確認
    - [ ] ステークホルダーへの報告

- [ ] 旧 Lambda の停止
    - [ ] EventBridge トリガーの無効化
    - [ ] Lambda 関数の削除 (または無効化)

- [ ] 移行完了の確認
    - [ ] 全機能の動作確認
    - [ ] メトリクスの確認
    - [ ] ログの確認

- [ ] クリーンアップ
    - [ ] 不要なリソースの削除
    - [ ] ドキュメントの更新

---

## フェーズ3: 最適化 (継続的)

### パフォーマンス最適化

- [ ] 処理時間の最適化
    - [ ] ボトルネックの特定
    - [ ] API 呼び出しの最適化
    - [ ] データベースクエリの最適化

- [ ] リソース最適化
    - [ ] CPU/メモリ設定の調整
    - [ ] タスク実行時間の短縮
    - [ ] Fargate Spot の安定性確認

### コスト最適化

- [ ] リソース使用の見直し
    - [ ] より小さい CPU/メモリ設定の検証
    - [ ] 処理時間の短縮によるコスト削減
    - [ ] CloudWatch Logs 保持期間の最適化

- [ ] 定期的なコストレビュー
    - [ ] 月次コストレポートの作成
    - [ ] 最適化の余地の特定

### 機能追加

- [ ] 監視機能の強化
    - [ ] より詳細なメトリクス追加
    - [ ] カスタムダッシュボードの改善
    - [ ] アラート条件の細分化

- [ ] エラーハンドリングの強化
    - [ ] より詳細なエラーログ
    - [ ] 自動リトライメカニズムの実装
    - [ ] エラー通知の改善

---

## 削除された項目 (AWS Batch 関連)

以下の項目は、EventBridge + ECS アーキテクチャへの変更により不要となりました:

- ~~AWS Batch 環境の構築~~
- ~~Orchestrator Lambda の実装~~
- ~~Worker コンテナの個別ジョブ実装~~
- ~~ジョブキュー管理~~
- ~~Array Jobs の実装~~

---

## 技術負債・今後の検討事項

- [ ] 複数タスクの並列実行検討
    - [ ] 処理量が増加した場合の対応
    - [ ] タスク間の重複実行防止

- [ ] キャッシング戦略の検討
    - [ ] TradingView API レスポンスキャッシング
    - [ ] Exchange/Ticker データのキャッシング

- [ ] 高度な監視機能
    - [ ] カスタムメトリクスの追加
    - [ ] SLO/SLI の定義と監視

---

## 参考資料

- [要件定義書](./requirements.md)
- [AWS ECS Developer Guide](https://docs.aws.amazon.com/ecs/)
- [EventBridge Scheduled Rules](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-create-rule-schedule.html)
- [AWS Fargate Pricing](https://aws.amazon.com/fargate/pricing/)

---

**作成日**: 2025年10月30日    
**最終更新**: 2025年11月2日    
**バージョン**: 2.0 - EventBridge + ECS アーキテクチャへ変更
