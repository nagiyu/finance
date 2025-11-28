# Quickstart（開発者向け短縮手順）

この手順は新しい開発者がリポジトリをクローンして、30 分以内に開発環境を起動し主要なテストを実行できることを目標としています。

- ## 前提
- Node.js 20.x がインストールされていること
- `npm` が使用可能であること
- Docker があると DevContainer の利用が容易

## ローカルセットアップ（推奨）
```bash
# リポジトリをクローン
git clone git@github.com:YOUR_ORG/finance.git
cd finance

# 依存関係インストール（npm）
npm install

# ルートで型チェックとテストを実行
npm run typecheck
npm test
```

## 開発サーバ起動（クライアント）
```bash
# client ディレクトリに移動
cd client/finance
npm install
npm run dev
```

## 開発コンテナ（DevContainer）
- ルートに統一された `devcontainer` 設定を提供しますが、ルートに複数の設定を置くことや各プロジェクトごとの DevContainer の存在も許容します。重要なのは個々のファイル単位で不要に DevContainer を作成しないことです。VS Code の Remote - Containers 機能でルートまたは該当プロジェクトの DevContainer を開いてください。

## デプロイ（自動化）
- デプロイは GitHub Actions 経由で実行されます。AWS へのリソース作成は CloudFormation テンプレートを使用します。
- ローカルからデプロイする場合は、適切な AWS 資格情報を設定した上で CloudFormation を実行してください（ただし推奨はワークフロー経由）。

## テストの実行
- ユニット/統合: `npm test`（Jest）
- E2E（Playwright）: `npm run test:e2e`（導入後）

## よくある問題
- 依存関係のキャッシュ問題がある場合は `npm install --force` を試してください。

