# Data Model: エンティティ定義（リポジトリ構成・運用中心）

本機能は主にリポジトリ構成の整理とデプロイ自動化に関するため、データモデルはアプリケーションのビジネスデータではなく「構成要素（エンティティ）」を定義します。

## Entity: Module
- 説明: リポジトリ内の主要モジュール（`finance`, `client`, `server` 等）。
- フィールド:
    - `name` (string): モジュール名
    - `path` (string): リポジトリ内パス
    - `type` (enum): `service` | `client` | `library`
- バリデーション: `name` と `path` は必須。

## Entity: DevEnvironment
- 説明: 開発用環境定義（DevContainer, dev scripts）。
- フィールド:
    - `configPath` (string): ルートの環境定義ファイルパス
    - `tools` (array[string]): 必要ツール（node, pnpm 等）
- バリデーション: ルートに一本化された `devcontainer.json` の存在を期待。

## Entity: CIWorkflow
- 説明: GitHub Actions ワークフロー定義
- フィールド:
    - `workflowName` (string)
    - `path` (string)
    - `steps` (array): 実行ステップ（lint, typecheck, test, deploy 等）
- バリデーション: PR 時に lint/typecheck/test が実行されること。

## Entity: CloudResourceTemplate
- 説明: CloudFormation テンプレート（スタック定義）
- フィールド:
    - `templatePath` (string): `infra/cloudformation/` 下のテンプレートパス
    - `stackName` (string)
    - `parameters` (map)
- バリデーション: デプロイ用の最低限の IAM ポリシー設定を含めること。

## Entity: Quickstart
- 説明: 新規開発者向けセットアップ手順（quickstart.md）
- フィールド:
    - `docPath` (string)
    - `steps` (array[string])

## State Transitions
- DevEnvironment: `draft` -> `validated` -> `published`
- CIWorkflow: `draft` -> `tested` -> `active`
- CloudResourceTemplate: `draft` -> `staged` -> `deployed`

## 備考
- 上記は実装・移行作業を整理するための概念モデルです。ビジネスドメインのデータモデルには手を加えません。