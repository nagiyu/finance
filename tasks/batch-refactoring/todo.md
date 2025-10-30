# バッチ処理リファクタリング TODO

本ドキュメントは、[requirements.md](./requirements.md) および [technical-investigation.md](./technical-investigation.md) に基づいたバッチ処理リファクタリングの実装タスクリストです。

---

## フェーズ1: POC実装 (2-3週間)

### Week 1: インフラ構築

- [ ] AWS Batch 環境の構築
  - [ ] Compute Environment の作成（Fargate Spot）
  - [ ] Job Queue の作成（優先度設定）
  - [ ] Job Definition の作成（vCPU: 0.25, Memory: 512MB）
  - [ ] リトライ戦略の設定（最大3回、exponential backoff）

- [ ] ECR リポジトリの作成
  - [ ] finance-worker リポジトリの作成
  - [ ] リポジトリポリシーの設定

- [ ] IAM ロール・ポリシーの設定
  - [ ] Orchestrator Lambda 実行ロール作成
    - [ ] DynamoDB アクセス権限（GetItem, Scan, Query, UpdateItem）
    - [ ] AWS Batch ジョブ投入権限（SubmitJob）
    - [ ] Secrets Manager アクセス権限（GetSecretValue）
  - [ ] Batch Job 実行ロール作成
    - [ ] DynamoDB アクセス権限
    - [ ] Secrets Manager アクセス権限
    - [ ] CloudWatch Logs 書き込み権限
  - [ ] Batch Task 実行ロール作成（ECR、CloudWatch Logs）

- [ ] Infrastructure as Code（Terraform/CloudFormation）
  - [ ] Compute Environment のコード化
  - [ ] Job Queue のコード化
  - [ ] Job Definition のコード化
  - [ ] IAM ロール・ポリシーのコード化
  - [ ] VPC・セキュリティグループの設定

### Week 2: Worker 実装

- [ ] Worker コンテナの実装
  - [ ] 既存コードの分析と抽出
    - [ ] FinanceNotificationService の処理ロジック抽出
    - [ ] 1通知設定処理への分離
    - [ ] 環境変数からのパラメータ取得実装
  - [ ] Worker エントリーポイント作成（index.ts）
    - [ ] AWS Batch ジョブパラメータの受け取り
    - [ ] サービス初期化
    - [ ] 条件チェックと通知送信
    - [ ] エラーハンドリング実装
  - [ ] ログ出力の実装
    - [ ] 構造化ログフォーマット
    - [ ] 処理開始・完了ログ
    - [ ] エラーログ

- [ ] Docker 化
  - [ ] Dockerfile 作成
    - [ ] Node.js 18 Alpine ベースイメージ
    - [ ] 依存関係インストール（finance, common モジュール）
    - [ ] TypeScript ビルド（esbuild）
    - [ ] マルチステージビルドの検討
  - [ ] .dockerignore 作成
  - [ ] ローカルビルドテスト
  - [ ] イメージサイズ最適化

- [ ] ECR へのプッシュ
  - [ ] ビルドスクリプト作成
  - [ ] ECR 認証とプッシュスクリプト作成
  - [ ] 初回イメージプッシュ

- [ ] ローカルテスト環境構築
  - [ ] Docker Compose 設定（DynamoDB Local、LocalStack）
  - [ ] テストデータ作成
  - [ ] 動作確認

### Week 3: Orchestrator 実装と統合テスト

- [ ] Orchestrator Lambda の実装
  - [ ] 通知設定取得ロジック
    - [ ] DynamoDB Scan 実装
    - [ ] 頻度フィルタリングロジック抽出
  - [ ] AWS Batch ジョブ投入実装
    - [ ] ジョブパラメータ構築
    - [ ] batch.submitJob() 実装
    - [ ] エラーハンドリング
  - [ ] ログ出力実装

- [ ] EventBridge 連携
  - [ ] CloudWatch Events ルール作成（1分/10分/1時間）
  - [ ] Lambda トリガー設定
  - [ ] 権限設定

- [ ] 統合テスト
  - [ ] エンドツーエンドテスト
    - [ ] 少数の通知設定（5-10件）で動作確認
    - [ ] ジョブ投入から完了までの確認
    - [ ] 通知送信の確認
    - [ ] DynamoDB 更新の確認
  - [ ] エラーシナリオテスト
    - [ ] TradingView API エラー時のリトライ確認
    - [ ] DynamoDB エラー時の挙動確認
    - [ ] 3回リトライ後の失敗処理確認
  - [ ] パフォーマンステスト
    - [ ] 1ジョブあたりの処理時間測定
    - [ ] 並列実行数の確認
    - [ ] Fargate Spot 起動時間測定

- [ ] 監視・ログ設定
  - [ ] CloudWatch Logs グループ作成
  - [ ] CloudWatch Metrics 設定
    - [ ] ジョブ投入数
    - [ ] ジョブ完了数
    - [ ] ジョブ失敗数
  - [ ] CloudWatch Alarms 作成
    - [ ] ジョブ失敗アラート
    - [ ] Job Queue 深さアラート
  - [ ] CloudWatch Dashboards 作成（基本版）

- [ ] コスト測定
  - [ ] 1週間の運用コスト記録
  - [ ] Fargate Spot 中断頻度確認
  - [ ] 1ジョブあたりのコスト算出

- [ ] ドキュメント作成
  - [ ] セットアップ手順書
  - [ ] デプロイ手順書
  - [ ] トラブルシューティングガイド
  - [ ] POC 結果レポート作成

---

## フェーズ2: 段階的移行 (2-3週間)

### Week 1: カナリアリリース準備

- [ ] 移行準備
  - [ ] 移行対象ユーザーの選定（5-10%）
  - [ ] 移行フラグの実装（DynamoDB 属性追加）
  - [ ] ロールバック手順の整備
  - [ ] 監視体制の強化

- [ ] デュアル運用の実装
  - [ ] Orchestrator でのユーザーフィルタリング
  - [ ] 旧 Lambda の条件付き実行
  - [ ] メトリクス比較の仕組み構築

- [ ] カナリアリリース実施
  - [ ] 少数ユーザーでの試験運用開始（5-10%）
  - [ ] メトリクス収集と分析
    - [ ] 処理時間比較
    - [ ] 通知成功率比較
    - [ ] エラー率比較
  - [ ] 問題の特定と修正

### Week 2: 段階的拡大

- [ ] 25% ユーザーへ拡大
  - [ ] 移行フラグ更新
  - [ ] メトリクス監視
  - [ ] 問題対応

- [ ] 50% ユーザーへ拡大
  - [ ] 移行フラグ更新
  - [ ] パフォーマンス監視
  - [ ] スケーリング調整
  - [ ] コスト分析

- [ ] 75% ユーザーへ拡大
  - [ ] 移行フラグ更新
  - [ ] 最終検証
  - [ ] 残課題の洗い出し

### Week 3: 完全移行

- [ ] 100% ユーザーへ移行
  - [ ] 全ユーザーの移行実施
  - [ ] 旧 Lambda の停止
  - [ ] 移行フラグの削除

- [ ] 移行完了の確認
  - [ ] 全機能の動作確認
  - [ ] メトリクスの確認
  - [ ] ユーザーフィードバック確認

- [ ] クリーンアップ
  - [ ] 旧 Lambda リソースの削除
  - [ ] 不要な設定の削除
  - [ ] ドキュメント更新

---

## フェーズ3: 最適化（継続的）

### パフォーマンス最適化

- [ ] 処理時間の最適化
  - [ ] API 呼び出しの並列化
  - [ ] キャッシング戦略の検討
  - [ ] データベースクエリの最適化

- [ ] スケーリング最適化
  - [ ] Auto Scaling ポリシーの調整
  - [ ] Compute Environment の最適化
  - [ ] Job Queue 設定の最適化

### コスト最適化

- [ ] リソース最適化
  - [ ] より小さいインスタンスタイプの検証（c5.medium など）
  - [ ] ジョブのバッチ処理（複数設定を1ジョブで処理）
  - [ ] EC2 Spot インスタンスの活用検討

- [ ] 運用コスト削減
  - [ ] CloudWatch Logs の保持期間最適化
  - [ ] 不要なメトリクスの削減
  - [ ] 定期的なコストレビュー

### 機能追加

- [ ] 監視機能の強化
  - [ ] より詳細なメトリクス追加
  - [ ] X-Ray による分散トレーシング実装
  - [ ] カスタムダッシュボードの改善

- [ ] エラーハンドリングの強化
  - [ ] Dead Letter Queue の活用
  - [ ] エラー通知の詳細化
  - [ ] 自動復旧メカニズムの実装

- [ ] ジョブ管理機能
  - [ ] ジョブステータス追跡（FinanceJobStatus テーブル）
  - [ ] ジョブ履歴の記録
  - [ ] ジョブのキャンセル機能

---

## 技術負債・今後の検討事項

- [ ] Array Jobs の活用検討
  - [ ] 大量ジョブの効率的な投入
  - [ ] API コールオーバーヘッドの削減

- [ ] EC2 Spot への移行検討
  - [ ] 大規模化時のコスト削減
  - [ ] 性能評価

- [ ] 条件チェックの最適化
  - [ ] TradingView API レスポンスキャッシング
  - [ ] レート制限対策

- [ ] 高度な監視機能
  - [ ] カスタムメトリクスの追加
  - [ ] アラート条件の細分化
  - [ ] SLO/SLI の定義と監視

---

## 参考資料

- [要件定義書](./requirements.md)
- [技術調査結果](./technical-investigation.md)
- [AWS Batch User Guide](https://docs.aws.amazon.com/batch/latest/userguide/)
- [AWS Fargate Pricing](https://aws.amazon.com/fargate/pricing/)

---

**作成日**: 2025年10月30日  
**最終更新**: 2025年10月30日  
**バージョン**: 1.0
