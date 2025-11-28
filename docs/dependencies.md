# Dependency Rules and Cross-Component Imports

本ドキュメントでは、Finance Management System リポジトリにおけるコンポーネント間の依存関係ルールと共有パッケージの使用方法を説明します。

## ワークスペース構成

本リポジトリは pnpm ワークスペースとして管理されています。ワークスペースの定義は `pnpm-workspace.yaml` を参照してください。

### ワークスペースパッケージ

| パッケージ     | パス              | 説明                         |
| -------------- | ----------------- | ---------------------------- |
| finance        | `finance/`        | 金融データ処理コアモジュール |
| client/finance | `client/finance/` | Next.js フロントエンドアプリ |
| server/finance | `server/finance/` | AWS Lambda 関数              |

---

## 共有パッケージ

本リポジトリでは、以下の共有パッケージ（Git サブモジュール）を使用しています。

### typescript-common

**リポジトリ**: [nagiyu/nagiyu-typescript-common](https://github.com/nagiyu/nagiyu-typescript-common)  
**パス**: `typescript-common/`

**責務**:

- AWS サービス統合（DynamoDB、Secrets Manager）
- 認証・認可システム
- CRUD 操作の統一インターフェース
- 日付、通貨、通知などのユーティリティ

**使用ルール**:

- すべてのコンポーネント（`finance/`、`client/finance/`、`server/finance/`）から参照可能
- AWS サービス統合やデータアクセス層の実装には必ず `typescript-common` を使用する
- 共通のインターフェースや型定義は `typescript-common` で管理する

**インポート例**:

```typescript
// 相対パスでのインポート
import { DynamoDBClient } from '../../typescript-common/aws/dynamodb';
import { AuthService } from '../../typescript-common/auth';
```

### nextjs-common

**リポジトリ**: [nagiyu/nagiyu-nextjs-common](https://github.com/nagiyu/nagiyu-nextjs-common)  
**パス**: `nextjs-common/`

**責務**:

- 共通 UI コンポーネント
- 認証関連コンポーネント（NextAuth.js 連携）
- レイアウトコンポーネント

**使用ルール**:

- `client/finance/` からのみ参照可能
- 新しい UI コンポーネントを作成する前に、`nextjs-common` に既存のコンポーネントがないか確認する
- プロジェクト固有の UI コンポーネントは `client/finance/app/components/` に配置する

**インポート例**:

```typescript
// 相対パスでのインポート
import { AuthButton } from '../../nextjs-common/components/AuthButton';
import { Layout } from '../../nextjs-common/components/Layout';
```

---

## 依存関係ルール

### 許可される依存関係

以下の図は、コンポーネント間の許可される依存関係を示しています。

```
                    ┌─────────────────────┐
                    │  typescript-common  │
                    │    (共通基盤)       │
                    └─────────────────────┘
                              ▲
                              │ 参照可
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    finance/     │ │ client/finance/ │ │ server/finance/ │
│ (コアモジュール) │ │ (フロントエンド) │ │   (Lambda)      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          ▲                   │                   │
          │ 参照可            │ 参照可            │ 参照可
          └───────────────────┴───────────────────┘

                    ┌─────────────────────┐
                    │   nextjs-common     │
                    │ (Next.js 共通)      │
                    └─────────────────────┘
                              ▲
                              │ 参照可
                              │
                    ┌─────────────────┐
                    │ client/finance/ │
                    │ (フロントエンド) │
                    └─────────────────┘
```

### 依存関係の詳細ルール

| ソース            | ターゲット           | 許可 | 備考                                         |
| ----------------- | -------------------- | ---- | -------------------------------------------- |
| `finance/`        | `typescript-common/` | ✅   | 共通ユーティリティの利用                     |
| `finance/`        | `client/finance/`    | ❌   | コアモジュールはクライアントに依存しない     |
| `finance/`        | `server/finance/`    | ❌   | コアモジュールはサーバーに依存しない         |
| `finance/`        | `nextjs-common/`     | ❌   | Node.js 環境では Next.js 依存を使用しない    |
| `client/finance/` | `finance/`           | ✅   | ビジネスロジックの再利用（注1）              |
| `client/finance/` | `typescript-common/` | ✅   | 共通ユーティリティの利用                     |
| `client/finance/` | `nextjs-common/`     | ✅   | 共通 UI コンポーネントの利用                 |
| `client/finance/` | `server/finance/`    | ❌   | クライアントはサーバーコードを直接参照しない |
| `server/finance/` | `finance/`           | ✅   | ビジネスロジックの再利用                     |
| `server/finance/` | `typescript-common/` | ✅   | 共通ユーティリティの利用                     |
| `server/finance/` | `client/finance/`    | ❌   | サーバーはクライアントコードを参照しない     |
| `server/finance/` | `nextjs-common/`     | ❌   | Lambda 環境では Next.js 依存を使用しない     |

> **注1**: `client/finance/` から `finance/` への参照は、インターフェースや型定義の共有に限定することを推奨します。ビジネスロジックの大部分は API 経由で呼び出すべきです。

### 禁止される依存関係

以下のパターンは禁止されています：

1. **循環参照**: コンポーネント間で相互に依存関係を持つこと
2. **レイヤー違反**: 上位レイヤー（`client/`、`server/`）から下位レイヤー（`finance/`）への逆方向の参照
3. **環境違反**: クライアント専用コード（Next.js）をサーバーサイドで使用すること、またはその逆

---

## 共有パッケージの更新

### サブモジュールの初期化

リポジトリをクローンした後、以下のコマンドでサブモジュールを初期化します：

```bash
git submodule update --init --recursive
```

### サブモジュールの更新

共有パッケージを最新版に更新するには：

```bash
# typescript-common を更新
cd typescript-common
git pull origin main
cd ..

# nextjs-common を更新
cd nextjs-common
git pull origin main
cd ..

# 変更をコミット
git add typescript-common nextjs-common
git commit -m "chore: update submodules"
```

---

## 新しい依存関係の追加

### npm パッケージの追加

各コンポーネントに npm パッケージを追加する場合：

```bash
# finance コアモジュールに追加
cd finance
npm install <package-name>

# クライアントに追加
cd client/finance
npm install <package-name>

# サーバーに追加
cd server/finance
npm install <package-name>
```

### 共通機能の追加

複数のコンポーネントで使用する機能を追加する場合：

1. まず `typescript-common` に追加することを検討する
2. `typescript-common` に適さない場合は、`finance/` コアモジュールに追加する
3. Next.js 固有の機能は `nextjs-common` に追加する

---

## 関連ドキュメント

- 📖 [Repository Structure](./structure.md) — リポジトリ構成の詳細
- 📖 [プロジェクト README](../README.md) — プロジェクト全体の概要
- 🚀 [Quickstart ガイド](../specs/003-restructure-monorepo/quickstart.md) — 開発環境セットアップ
