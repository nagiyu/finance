# Finance Documentation Hub

Finance Management System のドキュメントハブです。各領域の詳細ドキュメントへのリンクを提供します。

## 主要ドキュメント領域

### [Finance Module](./finance/README.md)

金融データ処理と株価追跡機能を提供するコアモジュールのドキュメントです。

- 株価データ取得（TradingView API統合）
- 通知・アラートサービス
- 取引所・ティッカー管理
- [Server Documentation](./finance/server/README.md) - Lambda関数とAPIエンドポイント
- [Client Documentation](./finance/client/README.md) - Next.jsアプリケーションとUIコンポーネント

### [Common Module](./common/README.md)

アプリケーション全体で共有される基盤機能とユーティリティを提供するモジュールのドキュメントです。

- AWSサービス統合（DynamoDB、Secrets Manager）
- 認証システム
- データアクセス基盤
- ユーティリティ関数
- [Server Documentation](./common/server/README.md) - サーバーサイド実装
- [Client Documentation](./common/client/README.md) - クライアントサイド実装

### [Client Module](./client/README.md)

クライアントサイドアプリケーションの共通ドキュメントハブです。

- [Finance Client](./finance/client/README.md) - 金融データ表示アプリケーション
- [Common Client](./common/client/README.md) - 共通コンポーネントとユーティリティ

### [Guides](./guides/index.md)

開発時の参考情報とガイドラインです。

- プロジェクト概要
- システムパターン
- 技術コンテキスト

### [Settings](./settings/baseSetting.md)

環境設定と構成情報です。

- 基本設定ガイド

### [Templates](./templates/doc-template.md)

ドキュメント作成のためのテンプレートです。

- ドキュメントテンプレート

### [Contracts](./contracts/doc-metadata.schema.json)

ドキュメントメタデータのスキーマ定義です。

- ドキュメントフロントマターのJSONスキーマ

## 関連リンク

- [プロジェクトREADME](../README.md) - プロジェクト全体の概要
