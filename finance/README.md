# Finance Core Module

金融データ処理の中核となる共通ロジックとユーティリティを提供するモジュールです。

## 概要

本モジュールは以下の機能を提供します：

- 株価データ取得（TradingView API 統合）
- 通知・アラート機能
- 取引所・ティッカー管理
- 金融データの永続化

## 前提条件

- Node.js 20.x
- npm

## セットアップ

```bash
# finance ディレクトリに移動
cd finance

# 依存関係インストール
npm install
# または
npm run setup
```

## 主要コマンド

| コマンド | 説明 |
|---------|------|
| `npm run setup` | 依存関係のインストール |
| `npm test` | テストの実行（Jest） |
| `npm run typecheck` | TypeScript 型チェック |
| `npm run lint` | ESLint によるコードチェック |
| `npm run lint:fix` | ESLint による自動修正 |

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
   - **「Finance Core」** を選択（`.devcontainer/finance/devcontainer.json`）

3. **GitHub Codespaces を使用する場合**
   - GitHub リポジトリページで「Code」→「Codespaces」タブを選択
   - 「New codespace」をクリック
   - 設定から `.devcontainer/finance/devcontainer.json` を選択

### 推奨ワークスペース設定

DevContainer 起動後は `finance/finance.code-workspace` がワークスペースとして自動的に読み込まれます。このワークスペースには以下が含まれます：

- `finance/` - 本モジュール
- `typescript-common/common/` - 共通 TypeScript ユーティリティ（サブモジュール）

> **注意**: `typescript-common` はサブモジュールです。サブモジュールが未初期化の場合は `git submodule update --init --recursive` を実行してください。

ワークスペース設定には以下が含まれます：
- ESLint の自動修正（保存時）
- エディタのフォーマット設定（TypeScript、JavaScript、Markdown 等）

### 検証コマンド

DevContainer を起動した後、以下のコマンドを実行して環境が正しくセットアップされていることを確認してください：

```bash
# 依存関係をインストール
npm install

# 型チェックが成功することを確認
npm run typecheck

# テストが成功することを確認
npm test

# リントが通ることを確認
npm run lint
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

> **注意**: AWS 資格情報を使用する場合は、DevContainer 起動後に環境変数を設定するか、`.devcontainer/finance/devcontainer.json` を編集してください。

## ディレクトリ構成

```
finance/
├── conditions/      # 条件判定ロジック
├── consts/          # 定数定義
├── interfaces/      # TypeScript インターフェース
├── services/        # サービス層
├── tests/           # テストファイル
├── types/           # 型定義
├── utils/           # ユーティリティ関数
├── package.json     # パッケージ設定
├── tsconfig.json    # TypeScript 設定
└── jest.config.js   # Jest 設定
```

## 関連ドキュメント

- 📖 [Finance Module 詳細](../docs/finance/README.md)
- 📖 [ルート README](../README.md)
- 🚀 [Quickstart ガイド](../specs/003-restructure-monorepo/quickstart.md)
