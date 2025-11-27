# ドキュメント貢献ガイド

このドキュメントでは、Finance プロジェクトのドキュメントに貢献するための手順を説明します。

## テンプレートの使用

新しいドキュメントを作成する場合は、標準テンプレートを使用してください。

### テンプレートファイル

- **[ドキュメントテンプレート](./templates/doc-template.md)** - 新規ドキュメント作成用のテンプレート

### 使用手順

1. **テンプレートをコピー**

    ```bash
    cp docs/templates/doc-template.md docs/<対象ディレクトリ>/<新しいファイル名>.md
    ```

2. **フロントマターを更新**

    ファイル先頭のメタデータを適切に設定します：

    ```yaml
    ---
    title: "<ドキュメントタイトル>"
    area: <エリア>           # finance, common, client, guides など
    topic: <トピック>        # api, guide, architecture など
    owner: @<GitHubハンドル>
    last-updated: YYYY-MM-DD  # 例: 2025-11-27
    related-code-paths:
        - "<関連するコードパス>"
    status: active           # active, archived, migrated
    ---
    ```

3. **内容を記述**

    テンプレートの各セクション（目的、前提条件、手順、テスト/検証）に沿って内容を記述します。

### 必須フィールド

フロントマターには以下のフィールドが必須です（[スキーマ定義](./contracts/doc-metadata.schema.json)参照）：

| フィールド | 説明 | 例 |
|-----------|------|-----|
| `title` | ドキュメントのタイトル | `"API リファレンス"` |
| `owner` | ドキュメントオーナー | `@nagiyu` |
| `area` | ドキュメントの領域 | `finance`, `common`, `client` |
| `last-updated` | 最終更新日（YYYY-MM-DD） | `2025-11-27` |

## ドキュメント検証手順

ドキュメントをコミットする前に、以下の検証を実行してください。

### 1. Lint チェック

Markdown ファイルの構文と形式をチェックします：

```bash
npm run docs:lint
```

このコマンドは `remark` を使用して以下をチェックします：
- Markdown 構文の正確性
- 最終行の改行
- リンク参照の有効性

#### よくある警告と対処法

| 警告 | 対処法 |
|------|--------|
| `Unexpected missing final newline character` | ファイル末尾に改行を追加 |
| `Unexpected reference to undefined definition` | リンク参照の定義を追加するか、`\[` でエスケープ |

### 2. スキーマ検証

ドキュメントメタデータのスキーマを検証します：

```bash
npm run docs:validate
```

このコマンドは以下を確認します：
- フロントマターのスキーマ準拠
- 必須フィールドの存在

### 3. 検証の実行順序

ドキュメント変更時は以下の順序で検証を行ってください：

1. **Lint チェック** - 構文エラーがないことを確認
2. **スキーマ検証** - メタデータが正しいことを確認
3. **コミット** - 検証が成功したらコミット

```bash
# 推奨：一括検証
npm run docs:lint && npm run docs:validate
```

## PR 手順

1. **ブランチを作成**

    ```bash
    git checkout -b docs/<変更内容を表す名前>
    ```

2. **ドキュメントを編集**

    テンプレートを使用してドキュメントを作成または編集します。

3. **検証を実行**

    ```bash
    npm run docs:lint && npm run docs:validate
    ```

4. **変更をコミット**

    ```bash
    git add docs/
    git commit -m "docs: <変更内容の説明>"
    ```

5. **プルリクエストを作成**

    - GitHub 上でプルリクエストを作成
    - タイトルには `docs:` プレフィックスを使用
    - 変更内容の概要を記載

6. **レビューとマージ**

    - レビュアーからのフィードバックに対応
    - 必要に応じて修正を行い、再度検証を実行
    - 承認後、マージ

## 関連リソース

- [ドキュメントハブ](./index.md) - ドキュメント全体の目次
- [ドキュメントテンプレート](./templates/doc-template.md) - 新規ドキュメント用テンプレート
- [メタデータスキーマ](./contracts/doc-metadata.schema.json) - フロントマターの JSON スキーマ定義
