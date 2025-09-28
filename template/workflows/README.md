# Workflow Templates

このディレクトリには再利用可能なワークフローテンプレートが含まれています。

## テンプレート一覧

### build.yml
プルリクエストの検証とビルドを行うためのワークフローテンプレートです。

**置換が必要な変数:**
- `{{ PROJECT_NAME }}`: プロジェクト名 (例: `finance`)
- `{{ DEV_SECRET_NAME }}`: 開発環境のシークレット名 (例: `DevFinance`)

### unittest.yml
単体テスト（UnitTest）を実行するためのワークフローテンプレートです。
共通モジュール（common）の単体テストのみを実行します。

**置換が必要な変数:**
- なし（そのまま使用可能）

### update-template.yml
ソースリポジトリの変更をテンプレートリポジトリに反映するためのワークフローテンプレートです。

**置換が必要な変数:**
- `{{ TEMPLATE_REPOSITORY }}`: テンプレートリポジトリ名 (例: `nagiyu/nagiyu-aws-serverless-template`)
- `{{ SOURCE_REPOSITORY_URL }}`: ソースリポジトリのURL (例: `https://github.com/nagiyu/nagiyu-aws-serverless-sample.git`)
- `{{ SOURCE_BRANCH }}`: ソースブランチ名 (例: `master`)
- `{{ EXCLUDE_PATHS }}`: 除外するパス (例: `client/nextjs-sample tasks`)
- `{{ TARGET_BRANCH }}`: ターゲットブランチ名 (例: `master`)

### apply-template.yml
テンプレートリポジトリの変更をソースリポジトリに適用するためのワークフローテンプレートです。

**置換が必要な変数:**
- `{{ TEMPLATE_REPOSITORY_URL }}`: テンプレートリポジトリのURL (例: `https://github.com/nagiyu/nagiyu-aws-serverless-template.git`)
- `{{ TEMPLATE_BRANCH }}`: テンプレートブランチ名 (例: `master`)
- `{{ TARGET_BRANCH }}`: ターゲットブランチ名 (例: `master`)

### deploy.yml
デプロイメント用のワークフローテンプレートです。

## 使用方法

1. 対応するテンプレートファイルをコピー
2. 上記の変数を実際の値に置換
3. 必要に応じてワークフロー名やジョブ名を調整
4. `.github/workflows/` ディレクトリに配置

## 注意事項

- 元のワークフローファイルは削除せず、テンプレートとして再利用してください
- 変数の置換を忘れずに行ってください
- 必要に応じて環境固有の設定を追加してください
- **apply-template.yml**: セキュリティ上の理由により、`.github/workflows/` ディレクトリ内のファイルはテンプレート更新から自動的に除外されます