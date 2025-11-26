# データモデル — ドキュメントエンティティ

エンティティ: Document
- `id` (string): パス相対の識別子（例: `docs/finance/myticker.md`）。
- `title` (string): ドキュメントのタイトル。
- `area` (string): 上位レベルのエリア（例: `finance`, `client`, `guides`）。
- `topic` (string): サブトピック／カテゴリ。
- `owner` (string): 担当者（GitHubハンドルまたはチーム）。
- `last-updated` (string, date): ISO 8601 形式の日付（最終更新日）。
- `related-code-paths` (array[string]): トレーサビリティのための関連ソースパス。
- `status` (string): `active` | `archived` | `migrated`。

バリデーションルール:
- `title`, `area`, `owner`, `last-updated` は必須です。
- `related-code-paths` が存在する場合は、リポジトリ内の有効なパスである必要があります（手動確認を推奨）。

関係:
- ドキュメントは `id` によって他のドキュメントを参照することができます。

状態遷移:
- `active` → `migrated` （ターゲットの単一ソースドキュメントにマージされたとき）
- `active` → `archived` （廃止され履歴保存のためにアーカイブされたとき）
