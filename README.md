# Finance Management System

株価追跡・通知機能を持つ総合金融管理システムです。リアルタイム株価データの取得、チャート表示、アラート機能を提供します。

## 概要

本システムは以下の主要機能を提供します：

- **リアルタイム株価データ**: TradingView API による多様な金融商品の価格データ取得
- **インタラクティブチャート**: ECharts による高機能な株価チャート表示
- **アラート・通知システム**: 価格条件に基づく自動通知機能
- **マルチ取引所対応**: 国内外の主要取引所に対応
- **認証・権限管理**: セキュアなユーザー管理システム
- **クラウドネイティブ**: AWS サービスを活用したスケーラブルなアーキテクチャ

## システム構成

```
Finance Management System
├── finance/           # 金融データ処理コアモジュール
├── common/            # 共通ユーティリティ・サービス
├── server/            # サーバーサイド実装（Lambda関数）
├── client/            # クライアントアプリケーション（Next.js）
└── docs/              # ドキュメント
```

### アーキテクチャ概要

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client Web    │    │   Lambda APIs    │    │   External APIs │
│   (Next.js)     │◄──►│   (Node.js)      │◄──►│  (TradingView)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        
         │                        ▼                        
         │              ┌──────────────────┐              
         │              │   AWS Services   │              
         │              │  ┌─────────────┐ │              
         │              │  │  DynamoDB   │ │              
         │              │  └─────────────┘ │              
         │              │  ┌─────────────┐ │              
         │              │  │   Secrets   │ │              
         │              │  │   Manager   │ │              
         │              │  └─────────────┘ │              
         │              └──────────────────┘              
         │                                                
         ▼                                                
┌─────────────────┐                                      
│  Authentication │                                      
│   (NextAuth)    │                                      
└─────────────────┘                                      
```

## 主要モジュール

### Finance Module
金融データ処理の中核モジュールです。

**主要機能:**
- 株価データ取得（TradingView API統合）
- 通知・アラート機能
- 取引所・ティッカー管理
- 金融データの永続化

📚 [詳細ドキュメント](./docs/finance/README.md)

### Common Module  
アプリケーション共通の基盤機能を提供します。

**主要機能:**
- AWS サービス統合（DynamoDB、Secrets Manager）
- 認証・認可システム
- CRUD操作の統一インターフェース
- 各種ユーティリティ（日付、通貨、通知など）

📚 [詳細ドキュメント](./docs/common/README.md)

### Server Implementation
AWS Lambda を使用したサーバーレス実装です。

**構成:**
- **Finance Server**: 株価監視・通知のLambda関数
- **Common Server**: サーバー共通機能・最適化

📚 [Server ドキュメント](./docs/finance/server/README.md) | [Common Server ドキュメント](./docs/common/server/README.md)

### Client Applications
Next.js を使用したモダンなWebアプリケーションです。

**構成:**
- **Finance Client**: 株価チャート・監視ダッシュボード
- **Common Client**: 共通UIコンポーネント・認証

📚 [Client ドキュメント](./docs/finance/client/README.md) | [Common Client ドキュメント](./docs/common/client/README.md)

## 技術スタック

### Frontend
- **Framework**: Next.js 15.4.3 (React 19.1.1)
- **UI Library**: Material-UI (MUI) 7.2.0
- **Charts**: ECharts for React 3.0.2
- **Authentication**: NextAuth.js 4.24.11
- **Language**: TypeScript 5.x

### Backend  
- **Runtime**: Node.js (AWS Lambda)
- **Database**: Amazon DynamoDB
- **Secrets**: AWS Secrets Manager
- **Build**: esbuild (bundling & minification)
- **Language**: TypeScript 5.x

### External APIs
- **Stock Data**: TradingView API (@mathieuc/tradingview)
- **Date/Time**: Day.js
- **HTTP Client**: node-fetch

### Development Tools
- **Linting**: ESLint 9.x
- **Type Checking**: TypeScript
- **Testing**: Jest (unit tests)
- **Build**: esbuild, Next.js

## クイックスタート

### 前提条件
- Node.js 18.x 以上
- npm または yarn
- AWS アカウント（本番環境）

### ローカル開発環境セットアップ

1. **リポジトリクローン**
   ```bash
   git clone <repository-url>
   cd finance
   ```

2. **依存関係インストール**
   ```bash
   # 各モジュールで依存関係をインストール
   cd common && npm install
   cd ../finance && npm install
   cd ../client/finance && npm install
   cd ../server/finance && npm install
   ```

3. **環境変数設定**
   ```bash
   # .env.local ファイルを作成
   cp .env.example .env.local
   # 必要な環境変数を設定
   ```

4. **開発サーバー起動**
   ```bash
   cd client/finance
   npm run dev
   # http://localhost:3000 でアクセス
   ```

### ビルドとデプロイ

1. **クライアントビルド**
   ```bash
   cd client/finance
   npm run build
   ```

2. **サーバービルド**
   ```bash
   cd server/finance
   npm run build
   ```

## 環境設定

### 環境変数

| Variable | Description | Environment |
|----------|-------------|-------------|
| `PROCESS_ENV` | 実行環境 | `local`, `development`, `production` |
| `PROJECT_SECRET` | AWS Secrets Manager シークレット名 | AWS Lambda |
| `NEXTAUTH_SECRET` | NextAuth.js シークレット | Client |
| `NEXTAUTH_URL` | アプリケーションURL | Client |

### AWS リソース

#### DynamoDB テーブル
- **Production**: `Finance`
- **Development**: `DevFinance`

#### Secrets Manager
```json
{
  "CLIENT_BASE_URL": "https://your-app-domain.com"
}
```

#### IAM ロール
Lambda実行ロールには以下の権限が必要：
- DynamoDB: GetItem, PutItem, UpdateItem, Scan, Query
- Secrets Manager: GetSecretValue

## 機能詳細

### 株価データ取得
- **対応取引所**: NYSE, NASDAQ, TSE など主要取引所
- **対応時間軸**: 1分足〜月足まで対応
- **セッション**: 通常取引時間・時間外取引

### アラート機能
- **条件設定**: 価格上昇・下降、出来高、移動平均など
- **通知方法**: Webプッシュ通知
- **頻度制御**: 分次・日次レベルでの通知頻度調整

### チャート機能
- **インタラクティブ操作**: ズーム、パン、マーカー
- **テクニカル指標**: 移動平均、ボリンジャーバンドなど
- **カスタマイズ**: 色テーマ、表示項目の調整

## セキュリティ

### 認証・認可
- NextAuth.js による OAuth 連携
- ロールベースアクセス制御
- セッション管理とタイムアウト

### データ保護
- AWS Secrets Manager による機密情報管理
- HTTPS 通信の強制
- 入力値検証とサニタイゼーション

### インフラセキュリティ
- IAM ロールによる最小権限
- VPC エンドポイント（推奨）
- CloudWatch による監視

## モニタリング

### パフォーマンス監視
- Lambda関数の実行時間・エラー率
- DynamoDB の読み書きキャパシティ
- Client側のレスポンス時間

### ログ管理
- CloudWatch Logs による統一ログ管理
- 構造化ログによる効率的な検索
- エラー追跡とアラート

## トラブルシューティング

### よくある問題

1. **TradingView API エラー**
   - レート制限の確認
   - ネットワーク接続の確認
   - 市場の開場時間の確認

2. **DynamoDB エラー**
   - IAM権限の確認
   - テーブル名の設定確認
   - キャパシティ不足の確認

3. **認証エラー**
   - NextAuth設定の確認
   - 環境変数の確認
   - セッション期限の確認

### サポート情報
- ログの確認場所
- エラーコードの意味
- パフォーマンス最適化のヒント

## ドキュメント

- 📖 [Finance Module](./docs/finance/README.md) - 金融データ処理モジュール
- 📖 [Common Module](./docs/common/README.md) - 共通機能モジュール
- 🔧 [設定ガイド](./docs/settings/baseSetting.md) - 環境設定手順
- 📝 [開発ガイド](./docs/guides/index.md) - 開発時の参考情報

## ライセンス

本プロジェクトは Apache License 2.0 および MIT License のデュアルライセンスです。
詳細は [Apache_LICENSE](./Apache_LICENSE) および [MIT_LICENSE](./MIT_LICENSE) を参照してください。

## 貢献

プロジェクトへの貢献を歓迎します。Issue の報告や Pull Request をお気軽にお送りください。

---

**開発・保守**: Nagiyu  
**最終更新**: 2024年
