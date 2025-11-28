# Finance Client

Next.js を使用した株価チャート・監視ダッシュボードのフロントエンドアプリケーションです。

## 概要

本アプリケーションは以下の機能を提供します：

- リアルタイム株価チャート表示
- 価格アラート・通知ダッシュボード
- ユーザー認証（NextAuth.js）
- インタラクティブなデータビジュアライゼーション

## 前提条件

- Node.js 20.x
- npm

## セットアップ

```bash
# client/finance ディレクトリに移動
cd client/finance

# 依存関係インストール
npm install
# または
npm run setup
```

## 主要コマンド

| コマンド | 説明 |
|---------|------|
| `npm run setup` | 依存関係のインストール |
| `npm run dev` | 開発サーバの起動（http://localhost:3000） |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバの起動 |
| `npm run typecheck` | TypeScript 型チェック |
| `npm run lint` | ESLint によるコードチェック |
| `npm run lint:fix` | ESLint による自動修正 |
| `npm test` | テストの実行 |

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
   - **「Finance Client」** を選択（`.devcontainer/client/devcontainer.json`）

3. **GitHub Codespaces を使用する場合**
   - GitHub リポジトリページで「Code」→「Codespaces」タブを選択
   - 「New codespace」をクリック
   - 設定から `.devcontainer/client/devcontainer.json` を選択

### 推奨ワークスペース設定

DevContainer 起動後は `client/finance/finance.code-workspace` がワークスペースとして自動的に読み込まれます。このワークスペースには以下が含まれます：

- `client/finance/` - 本アプリケーション（client-finance）
- `nextjs-common/common/` - 共通 Next.js コンポーネント（サブモジュール）
- `typescript-common/common/` - 共通 TypeScript ユーティリティ（サブモジュール）
- `finance/` - 金融コアモジュール

> **注意**: `nextjs-common` と `typescript-common` はサブモジュールです。サブモジュールが未初期化の場合は `git submodule update --init --recursive` を実行してください。

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

# 開発サーバを起動して動作確認
npm run dev
# ブラウザで http://localhost:3000 にアクセス
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
| `NEXTAUTH_URL` | NextAuth.js のベース URL | `http://localhost:3000` |

> **注意**: AWS 資格情報を使用する場合は、DevContainer 起動後に環境変数を設定するか、`.devcontainer/client/devcontainer.json` を編集してください。

## ディレクトリ構成

```
client/finance/
├── app/             # Next.js App Router ページ
├── public/          # 静的ファイル
├── services/        # API サービス層
├── interfaces/      # TypeScript インターフェース
├── utils/           # ユーティリティ関数
├── package.json     # パッケージ設定
├── tsconfig.json    # TypeScript 設定
└── next.config.ts   # Next.js 設定
```

## Learn More

Next.js についてさらに学ぶには、以下のリソースを参照してください：

- [Next.js Documentation](https://nextjs.org/docs) - Next.js の機能と API について学ぶ
- [Learn Next.js](https://nextjs.org/learn) - インタラクティブな Next.js チュートリアル

## Deploy on Vercel

Next.js アプリを最も簡単にデプロイする方法は [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) を使用することです。

詳細は [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) を参照してください。

## 関連ドキュメント

- 📖 [Client ドキュメント](../../docs/finance/client/README.md)
- 📖 [ルート README](../../README.md)
- 🚀 [Quickstart ガイド](../../specs/003-restructure-monorepo/quickstart.md)
