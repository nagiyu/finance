# Finance Server

AWS Lambda 向けのサーバーサイドアプリケーションです。株価監視・通知機能を提供します。

## 責務

本モジュールは AWS Lambda 上で動作するサーバーサイド処理を担当します。株価データの定期監視、価格条件に基づくアラート判定の実行、AWS サービスとの連携など、バックエンド側のすべての処理を担います。

**このモジュールが担当すること:**

- Lambda 関数のエントリーポイントとハンドラー実装
- EventBridge によるスケジュール実行の処理
- AWS サービス（DynamoDB、Secrets Manager）との連携
- 価格条件に基づくアラート通知の送信
- サーバーサイドのビルド・デプロイ設定

**このモジュールが担当しないこと:**

- 株価データの取得・加工ロジック → `finance` モジュールが担当
- UI 表示やユーザーインタラクション → `client/finance` が担当
- フロントエンド用の API エンドポイント → `client/finance` の API ルートが担当

## 概要

本モジュールは以下の機能を提供します：

- 株価データの監視と取得
- 価格条件に基づくアラート通知
- AWS サービス（DynamoDB、Secrets Manager）との連携
- EventBridge によるスケジュール実行

## ディレクトリ構成

```
server/
├── finance/         # メインの Lambda 関数実装
│   ├── index.ts     # エントリーポイント
│   └── ...
├── common/          # サーバー共通機能
└── .eslintrc.js     # ESLint 設定
```

## 前提条件

- Node.js 20.x（ローカル開発用）または Node.js 22.x（Lambda 環境）
- npm

## セットアップ

```bash
# server/finance ディレクトリに移動
cd server/finance

# 依存関係インストール
npm install
# または
npm run setup
```

## 主要コマンド（server/finance）

| コマンド | 説明 |
|---------|------|
| `npm run setup` | 依存関係のインストール |
| `npm run build` | Lambda 用のビルド（esbuild） |
| `npm run typecheck` | TypeScript 型チェック |
| `npm run lint` | ESLint によるコードチェック |
| `npm run lint:fix` | ESLint による自動修正 |
| `npm test` | テストの実行 |

### ビルドの確認

```bash
npm run build
# dist/index.js が生成されることを確認
```

### ローカルでの動作確認

```bash
# EventBridge 関連のテスト
node test-eventbridge.js

# ユーティリティのテスト
node test-financeutil.js
```

## DevContainer を使用した開発

本モジュール用の DevContainer 設定がリポジトリルートに用意されています。VS Code の Dev Containers 拡張機能または GitHub Codespaces で利用できます。

### DevContainer の起動方法

1. **VS Code でリポジトリを開く**
   ```
   VS Code でリポジトリルートを開きます
   ```

2. **DevContainer を起動**
   - コマンドパレット（`F1` または `Ctrl+Shift+P` / `Cmd+Shift+P`）を開く
   - `Dev Containers: Reopen in Container...` を選択
   - **「Finance Server」** を選択（`.devcontainer/server/devcontainer.json`）

3. **GitHub Codespaces を使用する場合**
   - GitHub リポジトリページで「Code」→「Codespaces」タブを選択
   - 「New codespace」をクリック
   - 設定から `.devcontainer/server/devcontainer.json` を選択

### 推奨ワークスペース設定

DevContainer 起動後は `server/finance/finance.code-workspace` がワークスペースとして自動的に読み込まれます。このワークスペースには以下が含まれます：

- `server/finance/` - 本モジュール
- `server/common/` - サーバー共通機能
- `typescript-common/common/` - 共通 TypeScript ユーティリティ（サブモジュール）
- `finance/` - 金融コアモジュール

> **注意**: `typescript-common` はサブモジュールです。サブモジュールが未初期化の場合は `git submodule update --init --recursive` を実行してください。

ワークスペース設定には以下が含まれます：
- ESLint の自動修正（保存時）
- エディタのフォーマット設定（TypeScript、JavaScript、Markdown 等）

### 検証コマンド

DevContainer を起動した後、以下のコマンドを実行して環境が正しくセットアップされていることを確認してください：

```bash
# ワークスペースが server/finance に設定されているため、
# DevContainer 起動後は自動的にこのディレクトリが開かれます

# 依存関係をインストール
npm install

# 型チェックが成功することを確認
npm run typecheck

# テストが成功することを確認
npm test

# リントが通ることを確認
npm run lint

# ビルドが成功することを確認
npm run build
# dist/index.js が生成されることを確認
```

### DevContainer 環境変数

DevContainer には以下の環境変数が設定されています：

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `PROCESS_ENV` | 実行環境 | `local` |
| `PROJECT_SECRET` | AWS Secrets Manager シークレット名 | `DevFinance` |
| `PROJECT_AWS_ACCESS_KEY` | AWS アクセスキー | （空） |
| `PROJECT_AWS_SECRET_ACCESS_KEY` | AWS シークレットアクセスキー | （空） |
| `PROJECT_AWS_REGION` | AWS リージョン | （空） |

> **注意**: AWS 資格情報を使用する場合は、DevContainer 起動後に環境変数を設定するか、`.devcontainer/server/devcontainer.json` を編集してください。

### DevContainer の特徴

サーバー用 DevContainer は AWS Lambda Node.js 22 ランタイムベースのイメージを使用しています。これにより、Lambda 本番環境に近い状態での開発・テストが可能です。

## デプロイ

本モジュールは AWS Lambda にデプロイされます。

1. **ビルド**
   ```bash
   npm run build
   ```

2. **デプロイ**（GitHub Actions 経由で自動化推奨）
   - `dist/index.js` を Lambda 関数にアップロード
   - または CloudFormation テンプレートを使用してデプロイ

## 関連ドキュメント

- 📖 [Server ドキュメント](../docs/finance/server/README.md)
- 📖 [ルート README](../README.md)
- 🚀 [Quickstart ガイド](../specs/003-restructure-monorepo/quickstart.md)
