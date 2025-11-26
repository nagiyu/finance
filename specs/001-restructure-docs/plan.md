# 実装計画: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: `/specs/[###-feature-name]/spec.md` からの機能仕様

**注意**: このテンプレートは `/speckit.plan` コマンドで生成されます。実行ワークフローは `.specify/templates/commands/plan.md` を参照してください。

## 要約

リポジトリのドキュメントを `docs/` 配下に再構成・統合し、ドキュメント駆動開発を可能にするテンプレートと移行計画を提供します。調査では軽量な Markdown リントと CI チェック、ドキュメントのメタデータスキーマが推奨されており、パイロット移行は `docs/`、`finance/`、`client/finance` に焦点を当てます。

## 技術的コンテキスト

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**言語/バージョン**: リポジトリは TypeScript（Node 18+/TS 5.x）と Markdown ドキュメントを含みます。本機能のランタイムに関する言語選択は不要ですが、ツール群は Node/TypeScript ベースを想定しています。
**主な依存**: 既存リポジトリは `typescript-common` と `nextjs-common` のサブモジュールを使用しています。ドキュメントツールとしては `remark`/`remark-lint`、`markdownlint`、`prettier` を提案しています。
**保管場所**: ファイルシステム（Git リポジトリ）— ドキュメントは主に `docs/` と `specs/` に格納されます。
**テスト**: コード変更には既存のテストランナー（`jest`）を使用します。ドキュメントには `markdownlint` 等のチェックを追加し、CI に docs 検証ジョブを追加する想定です（CI 統合の詳細は要確認）。
**対象プラットフォーム**: 開発者のローカル環境および CI（Linux ベースのランナー）。
**プロジェクト種別**: 複数の Node/TypeScript プロジェクトとドキュメント資産を含むモノリポジトリ。
**パフォーマンス目標**: ドキュメント作業には該当なし（N/A）。
**制約**: TypeScript の厳格性、リンティング、共有サブモジュールの再利用に関するリポジトリの規約に従うこと。逸脱がある場合は記録する必要があります。
**スコープ/規模**: リポジトリ全体のドキュメントを対象とし、初期パイロットは `docs/`、`finance/`、`client/finance` に集中します。

## 憲法（Constitution）チェック

GATE: 計画はリポジトリの憲法に準拠していることを示す必要があります。以下は本ドキュメント作業向けのチェックと現状です。

- **型安全性とリンティング**: ドキュメントの変更はランタイムコードを変更しません。追加するツールや CI 設定の変更は既存の ESLint/Prettier の慣習に従わせます。Node ベースのドキュメントツールは共有設定を利用または拡張し、`typescript-common` から逸脱しないことを想定しています。
- **テスト戦略**: コードの変更は既存の `jest` テストでカバーされます。ドキュメント用の新しい検証は CI に lint/検証ステップとして追加します。コードのカバレッジ閾値は変更しません。
- **UX 受け入れ/アクセシビリティ**: 本機能は主に開発者向けです。クライアント向けのガイドを作成する際はテンプレートにアクセシビリティチェックリストを含めます。
- **パフォーマンス/リソース予算**: ドキュメント作業は該当なし。
- **共有サブモジュール**: コード変更が必要な場合は `typescript-common` と `nextjs-common` を引き続き使用します。ドキュメント機能自体は新規の共有サブモジュールを必要としない想定です。逸脱が発生した場合は `specs/001-restructure-docs/notes.md` に記録します。

参照: ガバナンスと必要な CI ゲートについては `.specify/memory/constitution.md` を参照してください。

## 設計後の憲法再評価

フェーズ0 の調査とフェーズ1 の初期成果（データモデル、コントラクト、クイックスタート）の後、本計画はリポジトリの憲法に準拠しています。`typescript-common` / `nextjs-common` からの必須逸脱は特定されませんでした。提案する CI の追加（docs/validate ジョブ）は既存の品質ゲートを緩めるものではなく、追記的なものとして文書化します。


## プロジェクト構成

### ドキュメント（本機能）

```text
specs/[###-feature]/
├── plan.md              # 本ファイル（`/speckit.plan` コマンド出力）
├── research.md          # フェーズ0 の出力（`/speckit.plan` コマンド）
├── data-model.md        # フェーズ1 の出力（`/speckit.plan` コマンド）
├── quickstart.md        # フェーズ1 の出力（`/speckit.plan` コマンド）
├── contracts/           # フェーズ1 の出力（`/speckit.plan` コマンド）
└── tasks.md             # フェーズ2 の出力（`/speckit.tasks` コマンド - `/speckit.plan` では作成されません）
```

### ソースコード（リポジトリルート）
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# （未使用なら削除）オプション1: 単一プロジェクト（デフォルト）
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# （未使用なら削除）オプション2: Webアプリ（"frontend" + "backend" を検出した場合）
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# （未使用なら削除）オプション3: モバイル + API（"iOS/Android" を検出した場合）
api/
└── （バックエンドと同様）

ios/ または android/
└── （プラットフォーム固有の構成: 機能モジュール、UI フロー、プラットフォームテスト）
```

**構成の決定**: [選択した構成を文書化し、上記の実際のパスを参照してください]

## 複雑性の追跡

> **規約チェックに違反があり、正当化が必要な場合のみ記入してください**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [例: 4 番目のプロジェクト] | [現在の必要性] | [なぜ 3 プロジェクトでは不十分か] |
| [例: リポジトリパターン] | [具体的な問題] | [なぜ直接 DB アクセスが不十分か] |
