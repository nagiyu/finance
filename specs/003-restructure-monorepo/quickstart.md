# Quickstart（開発者向け短縮手順）

この手順は新しい開発者がリポジトリをクローンして、30 分以内に開発環境を起動し主要なテストを実行できることを目標としています。

## 前提

- Node.js 20.x がインストールされていること
- `npm` が使用可能であること
- Docker があると DevContainer の利用が容易

---

## 開発コンテナ（DevContainer）- 推奨

コンポーネント別に DevContainer を管理しています。VS Code の Remote - Containers 機能で該当コンポーネントの DevContainer を開いてください。

### 推奨 DevContainer 設定ファイル

| コンポーネント | DevContainer パス | 状態 | 用途 |
|---------------|-------------------|------|------|
| クライアント（Next.js） | `.devcontainer/client/devcontainer.json` | ✅ 利用可能 | クライアントアプリ開発 |
| サーバー（Lambda） | `.devcontainer/server/devcontainer.json` | ✅ 利用可能 | サーバーサイド開発 |
| finance（共通ロジック） | `.devcontainer/finance/devcontainer.json` | ✅ 利用可能 | 共通モジュール開発 |
| spec-kit | `.devcontainer/spec-kit/devcontainer.json` | ✅ 利用可能 | 仕様書作成ツール |

### DevContainer の起動方法

1. VS Code でリポジトリを開く
2. コマンドパレット（`F1` または `Ctrl+Shift+P`）を開く
3. `Dev Containers: Open Folder in Container...` を選択
4. リポジトリルートを選択
5. 該当する DevContainer 設定を選択（例: `.devcontainer/client/devcontainer.json`）

> **注意**: サブディレクトリ直下（例: `client/finance/.devcontainer/`, `server/finance/.devcontainer/`）に残る DevContainer は legacy 設定です。今後ルート直下の `.devcontainer/<component>/` 形式へ統一する予定です（T005 で一覧化・T019 で整理予定）。移行完了までは、まずルート直下の設定を優先して使用してください。

---

## ローカルセットアップ（DevContainer を使用しない場合）

```bash
# リポジトリをクローン
git clone git@github.com:YOUR_ORG/finance.git
cd finance

# 依存関係インストール（npm）
npm install
```

---

## 各コンポーネントの起動手順

### 1. クライアント（client/finance）

Next.js ベースのフロントエンドアプリケーションです。

```bash
# client ディレクトリに移動
cd client/finance

# 依存関係インストール
npm install

# 開発サーバ起動
npm run dev
```

**確認方法**:
- ブラウザで `http://localhost:3000` にアクセス
- ページが正常に表示されることを確認

**ビルド・リント・型チェック**:
```bash
npm run build      # 本番ビルド
npm run lint       # ESLint 実行
npm run typecheck  # TypeScript 型チェック
npm run setup      # 依存関係インストール
```

### 2. サーバー（server/finance）

AWS Lambda 向けのサーバーサイドアプリケーションです。

```bash
# server ディレクトリに移動
cd server/finance

# 依存関係インストール
npm install

# ビルド
npm run build
```

**確認方法**:
- `dist/index.js` が生成されることを確認
- ローカルでの動作確認:
  ```bash
  node test-eventbridge.js   # EventBridge 関連のテスト
  node test-financeutil.js   # ユーティリティのテスト
  ```

**リント・型チェック**:
```bash
npm run lint       # ESLint 実行
npm run lint:fix   # ESLint 自動修正
npm run typecheck  # TypeScript 型チェック
npm run setup      # 依存関係インストール
```

### 3. finance（共通ロジック）

共通のビジネスロジックとユーティリティを含むモジュールです。

```bash
# finance ディレクトリに移動
cd finance

# 依存関係インストール
npm install

# テスト実行
npm test
```

**確認方法**:
- Jest テストが全て成功することを確認

**リント・型チェック**:
```bash
npm run lint       # ESLint 実行
npm run lint:fix   # ESLint 自動修正
npm run typecheck  # TypeScript 型チェック
npm run setup      # 依存関係インストール
```

---

## テストの実行

| コンポーネント | テストコマンド | リント | 型チェック |
|---------------|---------------|--------|-----------|
| finance | `cd finance && npm test` | `npm run lint` | `npm run typecheck` |
| client/finance | `cd client/finance && npm test` | `npm run lint` | `npm run typecheck` |
| server/finance | `cd server/finance && npm run build` | `npm run lint` | `npm run typecheck` |

### ルートでの一括実行

```bash
# ルートディレクトリから
npm run lint          # ESLint 実行
npm run lint:fix      # ESLint 自動修正
npm run format        # Prettier でフォーマット
npm run format:check  # フォーマットチェック
```

### E2E テスト（導入後）

```bash
npm run test:e2e  # Playwright
```

---

## 30 分以内のセットアップ確認チェックリスト

以下の手順を 30 分以内に完了できることを確認してください。

- [ ] リポジトリのクローン（5 分）
- [ ] `npm install` による依存関係インストール（5 分）
- [ ] クライアント開発サーバの起動と動作確認（5 分）
- [ ] サーバーのビルド成功確認（5 分）
- [ ] finance モジュールのテスト実行（5 分）
- [ ] （オプション）DevContainer での環境起動（5 分）

---

## デプロイ（自動化）

- デプロイは GitHub Actions 経由で実行されます
- AWS へのリソース作成は CloudFormation テンプレートを使用します
- ローカルからデプロイする場合は、適切な AWS 資格情報を設定した上で CloudFormation を実行してください（ただし推奨はワークフロー経由）

---

## よくある問題

| 問題 | 解決方法 |
|-----|---------|
| 依存関係のキャッシュ問題 | `npm install --force` を試す |
| DevContainer が起動しない | Docker Desktop が起動していることを確認 |
| ポート 3000 が使用中 | 既存のプロセスを停止するか、別のポートを指定 |
| TypeScript のエラー | `npm run typecheck` で詳細を確認 |

