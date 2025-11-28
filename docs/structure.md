# Repository Structure

本ドキュメントでは、Finance Management System リポジトリのモジュール配置と各コンポーネントの責務を説明します。主要機能の実装箇所を 3 分以内に特定できることを目標としています。

## トップレベル構成

```
finance/                          # リポジトリルート
├── finance/                      # 金融データ処理コアモジュール
├── client/                       # クライアントアプリケーション群
│   └── finance/                  # Next.js フロントエンドアプリ
├── server/                       # サーバーサイド実装
│   ├── finance/                  # Lambda 関数（株価監視・通知）
│   └── common/                   # サーバー共通機能
├── docs/                         # ドキュメント
├── infra/                        # インフラ定義（CloudFormation）
├── scripts/                      # ビルド・検証スクリプト
├── specs/                        # 仕様書
├── typescript-common/            # 共通 TypeScript ユーティリティ（サブモジュール）
├── nextjs-common/                # 共通 Next.js コンポーネント（サブモジュール）
└── .devcontainer/                # コンポーネント別 DevContainer 設定
```

---

## コンポーネント詳細

### 1. `finance/` — 金融データ処理コアモジュール

**責務**: 株価データ取得、条件判定、通知ロジックなど金融ドメインの中核機能を提供します。

| ディレクトリ | 説明 |
|-------------|------|
| `conditions/` | 価格条件判定ロジック（GreaterThan, LessThan, 各種チャートパターン） |
| `services/` | ビジネスロジック層（ConditionService, TickerService, ExchangeService 等） |
| `interfaces/` | TypeScript インターフェース定義 |
| `types/` | 型定義 |
| `consts/` | 定数定義 |
| `utils/` | ユーティリティ関数 |
| `tests/` | テストファイル |

**主要サービス**:
- `ConditionService` — 価格条件の評価
- `TickerService` — ティッカー（銘柄）管理
- `ExchangeService` — 取引所データ管理
- `FinanceNotificationService` — 通知処理
- `MyTickerService` — ユーザー登録銘柄管理

**package.json スクリプト**:

| コマンド | 説明 |
|---------|------|
| `npm run setup` | 依存関係のインストール |
| `npm test` | Jest によるテスト実行 |
| `npm run typecheck` | TypeScript 型チェック |
| `npm run lint` | ESLint によるコードチェック |
| `npm run lint:fix` | ESLint による自動修正 |

📁 **パス**: `finance/`  
📖 **詳細**: [finance/README.md](../finance/README.md)

---

### 2. `client/finance/` — フロントエンドアプリケーション

**責務**: Next.js を使用した株価チャート・監視ダッシュボードの Web UI を提供します。

| ディレクトリ | 説明 |
|-------------|------|
| `app/` | Next.js App Router ページ・コンポーネント |
| `app/api/` | API Routes（認証、通知送信等） |
| `app/components/` | UI コンポーネント |
| `app/exchanges/` | 取引所関連ページ |
| `app/myticker/` | ユーザー銘柄ページ |
| `app/tickers/` | 銘柄詳細ページ |
| `app/finance-notification/` | 通知管理ページ |
| `services/` | API サービス層 |
| `interfaces/` | TypeScript インターフェース |
| `utils/` | ユーティリティ関数 |
| `public/` | 静的ファイル |

**package.json スクリプト**:

| コマンド | 説明 |
|---------|------|
| `npm run setup` | 依存関係のインストール |
| `npm run dev` | 開発サーバ起動（http://localhost:3000） |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバ起動 |
| `npm run typecheck` | TypeScript 型チェック |
| `npm run lint` | ESLint によるコードチェック |
| `npm run lint:fix` | ESLint による自動修正 |
| `npm test` | テスト実行 |

📁 **パス**: `client/finance/`  
📖 **詳細**: [client/finance/README.md](../client/finance/README.md)

---

### 3. `server/` — サーバーサイド実装

**責務**: AWS Lambda 向けのサーバーレス関数を提供します。株価監視とプッシュ通知を担当します。

#### `server/finance/` — Finance Lambda 関数

| ファイル/ディレクトリ | 説明 |
|---------------------|------|
| `index.ts` | Lambda ハンドラエントリーポイント |
| `dist/` | ビルド成果物（esbuild） |

**主な処理フロー**:
1. EventBridge によるスケジュール起動
2. 株価データ取得・条件評価
3. 条件に合致した場合に通知送信

**package.json スクリプト**:

| コマンド | 説明 |
|---------|------|
| `npm run setup` | 依存関係のインストール |
| `npm run build` | esbuild による Lambda 用ビルド |
| `npm run typecheck` | TypeScript 型チェック |
| `npm run lint` | ESLint によるコードチェック |
| `npm run lint:fix` | ESLint による自動修正 |
| `npm test` | テスト実行 |

📁 **パス**: `server/finance/`  
📖 **詳細**: [server/README.md](../server/README.md)

#### `server/common/` — サーバー共通機能

サーバーサイドで共有される共通機能を提供します。

📁 **パス**: `server/common/`

---

### 4. 共有モジュール（サブモジュール）

#### `typescript-common/`

**責務**: TypeScript プロジェクト間で共有されるユーティリティを提供します。

- AWS サービス統合（DynamoDB、Secrets Manager）
- 認証・認可システム
- CRUD 操作の統一インターフェース
- 日付、通貨、通知などのユーティリティ

> **注意**: サブモジュールです。未初期化の場合は `git submodule update --init --recursive` を実行してください。

#### `nextjs-common/`

**責務**: Next.js アプリケーション間で共有されるコンポーネントを提供します。

- 共通 UI コンポーネント
- 認証関連コンポーネント

> **注意**: サブモジュールです。未初期化の場合は `git submodule update --init --recursive` を実行してください。

---

### 5. その他のディレクトリ

| ディレクトリ | 説明 |
|-------------|------|
| `docs/` | プロジェクトドキュメント |
| `infra/cloudformation/` | AWS CloudFormation テンプレート |
| `scripts/` | ビルド・デプロイ・検証スクリプト |
| `specs/` | 機能仕様書 |
| `.devcontainer/` | コンポーネント別 DevContainer 設定 |
| `.github/workflows/` | GitHub Actions ワークフロー |

---

## 機能から実装箇所を探す

| 機能 | 実装箇所 |
|------|---------|
| 株価データ取得 | `finance/services/TickerService.ts` |
| 価格条件の判定 | `finance/conditions/` |
| 通知ロジック | `finance/services/FinanceNotificationService.ts` |
| Lambda ハンドラ | `server/finance/index.ts` |
| 株価チャート UI | `client/finance/app/tickers/` |
| 銘柄登録 UI | `client/finance/app/myticker/` |
| 取引所管理 UI | `client/finance/app/exchanges/` |
| 通知管理 UI | `client/finance/app/finance-notification/` |
| API Routes | `client/finance/app/api/` |
| AWS リソース定義 | `infra/cloudformation/` |

---

## ルート package.json スクリプト

リポジトリルートの `package.json` には以下のスクリプトが定義されています：

| コマンド | 説明 |
|---------|------|
| `npm run lint` | ESLint によるルートレベルのコードチェック |
| `npm run lint:fix` | ESLint による自動修正 |
| `npm run format` | Prettier によるフォーマット |
| `npm run format:check` | フォーマットチェック |
| `npm run docs:lint` | ドキュメントの Markdown リント |
| `npm run docs:validate` | ドキュメントバリデーション |
| `npm run setup` | 依存関係のインストール |

---

## DevContainer 設定

コンポーネント別に DevContainer が用意されています：

| コンポーネント | DevContainer パス | 説明 |
|---------------|------------------|------|
| Finance Core | `.devcontainer/finance/` | 金融コアモジュール開発用 |
| Client | `.devcontainer/client/` | Next.js クライアント開発用 |
| Server | `.devcontainer/server/` | Lambda サーバー開発用 |
| Spec Kit | `.devcontainer/spec-kit/` | 仕様管理ツール（Python） |

---

## 関連ドキュメント

- 📖 [ルート README](../README.md) — プロジェクト全体の概要
- 📖 [ドキュメントハブ](./index.md) — ドキュメント一覧
- 🚀 [Quickstart ガイド](../specs/003-restructure-monorepo/quickstart.md) — 開発環境セットアップ手順
- 📋 [タスク一覧](../specs/003-restructure-monorepo/tasks.md) — リポジトリ再編タスク
