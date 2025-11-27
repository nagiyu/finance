# Client Module

クライアントサイドアプリケーションの共通ドキュメントハブです。各アプリケーション固有のドキュメントへのリンクを提供します。

## 概要

Client モジュールは Next.js ベースの Web アプリケーションを提供します：

- **リアルタイムデータ表示**: ECharts を使用したインタラクティブなチャート表示
- **Material-UI ベースの UI**: 統一されたデザインシステム
- **認証システム**: NextAuth.js を使用した認証機能
- **レスポンシブデザイン**: モバイルファースト設計

## アプリケーション

### [Finance Client](../finance/client/README.md)

金融データ処理と株価トラッキング機能を提供するクライアントアプリケーションです。

**主要機能:**
- リアルタイム株価チャート
- 取引所・ティッカー選択
- 時間軸・セッション設定
- 通知設定管理

### [Common Client](../common/client/README.md)

アプリケーション全体で共有される共通コンポーネントとユーティリティを提供します。

**主要機能:**
- 共通UIコンポーネント（BasicStack、DirectionStack、BasicSelect など）
- 認証システム（Auth Hooks、Auth Context）
- API通信サービス
- カスタムReactフック

## 技術スタック

| 技術 | 用途 |
| ----- | ----- |
| Next.js | React フレームワーク |
| React | UI ライブラリ |
| TypeScript | 型安全性 |
| Material-UI | UIコンポーネント |
| ECharts | チャート表示 |
| NextAuth.js | 認証 |

## 関連ドキュメント

- [ドキュメントハブ](../index.md) - プロジェクト全体のドキュメントハブ
- [Finance Module](../finance/README.md) - Finance モジュール概要
- [Common Module](../common/README.md) - Common モジュール概要
