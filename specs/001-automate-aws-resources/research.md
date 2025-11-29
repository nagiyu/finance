# Research: 技術決定と検討（日本語）

## 概要（Decision）
- IaC は既存方針に従い **CloudFormation（既存ワークフローの拡張）** を採用する。
- デプロイは GitHub Actions（既存）を継続利用し、スタック作成→ECR作成→イメージPUSH→Lambda更新の流れをCIで実行する。
- ACM は CloudFront 用に `us-east-1` に追加発行する前提とする。
- Lambda とローカル開発者用ユーザーに適用する共通ポリシーを CloudFormation で定義し、最小権限を目指して設計する。
- EventBridge Scheduler は server（バッチ）用に **毎分実行** を初期設定とする（テストでは短周期を使用可）。

## 技術詳細と理由（Rationale）
- CloudFormation を採用する理由:
    - 要件で「既存のデプロイ方式（CloudFormation ベース）を維持」が明記されているため互換性優先。
    - チームの既存テンプレートと GitHub Actions の統合が既にあるため学習コストが低い。
- 代替検討:
    - Terraform/CDK/SAM を検討したが、既存ワークフローとの互換性と運用コストで不利と判断（代替案としてドキュメント化）。
- ACM の地域制約:
    - CloudFront は `us-east-1` の ACM 証明書が必要。既存が別リージョンの場合、`us-east-1` に同名の証明書を追加発行する運用を採用。

## セキュリティと権限（Decision & Rationale）
- IAM 設計:
    - 共通ポリシー（Lambda 実行に必要な最小限のアクセス、ECR:Pull/Push、CloudWatch書き込み、S3アクセス等）を定義。
    - ローカル開発者（client/server）ユーザーは ECR プッシュと CloudFormation デプロイに必要な限定的権限のみ付与。
    - GitHub Actions 用ユーザーは CloudFormation 実行に必要な権限を付与（安全のため長期資格情報は避け、GitHub OIDC を検討できる旨記載）。

## テスト・CI（Decision）
- CI テストフロー:
    - スタック作成後の検証として CloudFormation 出力と ECR にイメージ存在の確認、Lambda のイメージタグ一致、client のヘルスチェック（CloudFront 経由 GET → 200）を自動化する。
    - 可能なら短時間の Canary 実行／ログ確認を組み込む。

## 未解決の検討事項（Alternatives / Notes）
- ドメインの最終 DNS 結合は外部クラウドサービス側の手順が必要（外部DNSの要件はプロジェクト運用チームと調整）。
- GitHub Actions の資格情報管理に関して、長期的には GitHub OIDC を推奨する（移行計画は別途）。

---

"Decision/理由/代替" はすべて日本語で記述済み。次は Phase 1 の成果物を生成します。
