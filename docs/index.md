# Finance Documentation Hub

Finance Management System のドキュメントハブです。各領域の詳細ドキュメントへのリンクを提供します。

## 主要ドキュメント領域

### [Repository Structure](./structure.md)

リポジトリのモジュール配置と各コンポーネントの責務を説明しています。主要機能の実装箇所を素早く特定するためのガイドです。

- トップレベル構成
- 各モジュールの責務
- 機能から実装箇所を探す
- package.json スクリプト一覧

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

## 探索テスト手順（新メンバーの30秒テスト）

新しくプロジェクトに参加したメンバーが、30秒以内に基本的な動作確認を行うためのテスト手順です。

### テスト手順

1. **ドキュメントハブへのアクセス**
    - `docs/index.md` を開く
    - 主要ドキュメント領域のリンクが表示されていることを確認

2. **主要ドキュメントの確認**
    - [Finance Module](./finance/README.md) リンクをクリック
    - ドキュメントが正しく表示されることを確認

3. **ガイドへのアクセス**
    - [Guides](./guides/index.md) リンクをクリック
    - ガイドの一覧が表示されることを確認

### 成功判定基準

以下のすべての条件を満たした場合、テスト成功とします：

| 判定項目 | 成功条件 |
|----------|----------|
| ドキュメントハブ表示 | `docs/index.md` が正しく表示され、すべてのリンクが確認できる |
| リンク動作 | 各セクションのリンクをクリックして対象ドキュメントに遷移できる |
| コンテンツ可読性 | 各ドキュメントの内容が読みやすく、構造が明確である |
| ナビゲーション | 関連リンクを使用してプロジェクトREADMEに戻ることができる |

### 所要時間

- 目標時間: 30秒以内
- 最大許容時間: 1分

## 関連リンク

- [プロジェクトREADME](../README.md) - プロジェクト全体の概要
