# タスク一覧: ドキュメント構造化とドキュメント駆動開発の整備

**Feature**: ドキュメント構造化とドキュメント駆動開発の整備
**Feature Dir**: `specs/001-restructure-docs`

---

## フェーズ構成

- **Phase 1: Setup** — 開発環境と CI/ツールの初期設定
- **Phase 2: Foundational** — テンプレートとスキーマ、ハブページ等の基盤整備
- **Phase 3+: ユーザーストーリー別フェーズ（優先度順）**
    - **US1 (P1)**: 開発者がドキュメントを追加・更新できるフローを整備
    - **US2 (P2)**: レビュア／新規メンバーが情報を素早く発見できる構造を整備
    - **US3 (P3)**: ドキュメント所有者が運用できる管理タスクを整備
- **Final Phase: Polish & Cross-cutting** — QA、CI整合、ドキュメントの移行適用

---

## チェックリスト形式のタスク

注: すべてのタスクは以下の形式に従います。

- [ ] T### [P?] [US?] 説明（ファイルパス）

---

### Phase 1: Setup

- [ ] T001 [P] ルート `package.json` にドキュメント検証用の devDependencies を追加（`remark-cli`, `remark-preset-lint-recommended`, `prettier`, `ajv`） — `package.json`
- [ ] T002 [P] リポジトリルートに `scripts` を追加: `docs:lint` と `docs:validate` を `package.json` に追加 — `package.json`
- [ ] T003 [P] GitHub Actions ワークフロー `docs/validate` のテンプレートを作成（`remark` と `ajv` を実行） — `.github/workflows/docs-validate.yml`
- [ ] T004 [P] `specs/001-restructure-docs/checklists/requirements.md` のスケルトンを作成（品質確認項目） — `specs/001-restructure-docs/checklists/requirements.md`

### Phase 2: Foundational

- [ ] T005 [P] ドキュメントメタデータ JSON Schema をリポジトリの `docs/contracts/doc-metadata.schema.json` にコピーまたはシンボリック配置 — `docs/contracts/doc-metadata.schema.json`
- [ ] T006 [P] ドキュメントテンプレートを `docs/templates/doc-template.md` として配置（`specs/.../contracts/doc-template.md` を流用） — `docs/templates/doc-template.md`
- [ ] T007 [P] ルート `docs/index.md`（ドキュメントハブ）を作成し、主要エリアへのリンク構造を定義 — `docs/index.md`
- [ ] T008 [P] `specs/001-restructure-docs/migration-plan.md` の雛形を作成（移行対象一覧を記載する CSV/Markdown テーブル欄を含む） — `specs/001-restructure-docs/migration-plan.md`

### Phase 3: User Story フェーズ（優先度順）

**US1 (P1) 開発者がドキュメントを作成/更新できるフロー**

- [ ] T009 [US1] [P] `docs/templates/doc-template.md` にフロントマターと必須フィールド説明を追記（`owner`, `area`, `topic`, `last-updated`, `related-code-paths` の例） — `docs/templates/doc-template.md`
- [ ] T010 [US1] `PULL_REQUEST_TEMPLATE` を更新してドキュメント更新チェックリストを追加（レビューチェック項目） — `.github/PULL_REQUEST_TEMPLATE/documentation.md`
- [ ] T011 [US1] リポジトリのルート `README.md` に「ドキュメント編集手順（テンプレート使用/PR手順）」を追記 — `README.md`
- [ ] T012 [US1] `specs/001-restructure-docs/migration-plan.md` を実際に 1 件分で埋める（パイロット移行: 既存ドキュメント1件を `docs/` へ移動して frontmatter を追加） — `specs/001-restructure-docs/migration-plan.md`
- [ ] T013 [US1] `package.json` の `scripts.docs:validate` を使ってローカル検証手順を `specs/001-restructure-docs/quickstart.md` に追記（コマンド例を明記） — `specs/001-restructure-docs/quickstart.md`

**US2 (P2) レビュア／新規メンバーの発見性改善**

- [ ] T014 [US2] `docs/finance/README.md` を作成して `finance` 領域のハブ（概要＋主要ドキュメントリンク）を追加 — `docs/finance/README.md`
- [ ] T015 [US2] `docs/client/README.md` を作成して `client` 領域のハブを追加（必要に応じ） — `docs/client/README.md`
- [ ] T016 [US2] `docs/index.md` に探索テスト手順（新メンバーの30秒テスト）を追加し、成功判定基準を明記 — `docs/index.md`

**US3 (P3) ドキュメント担当者の運用**

- [ ] T017 [US3] 所有者一覧 `specs/001-restructure-docs/owners.md` を作成（ドキュメントID → owner マッピング） — `specs/001-restructure-docs/owners.md`
- [ ] T018 [US3] ドキュメントレビューの定期テンプレート（`specs/001-restructure-docs/checklists/review-template.md`）を作成 — `specs/001-restructure-docs/checklists/review-template.md`
- [ ] T019 [US3] `specs/001-restructure-docs/migration-plan.md` を用いて優先度上位 5 件の移行パッチを作成する（各パッチは移動＋frontmatter 更新＋PR） — `specs/001-restructure-docs/migration-plan.md`

### Final Phase: Polish & Cross-cutting

- [ ] T020 [P] CI の `docs/validate` ワークフローを PR 上で実行し、実際の PR を用いてワークフローが成功することを検証（少なくとも1件） — `.github/workflows/docs-validate.yml`
- [ ] T021 [P] ドキュメント検証手順を `docs/CONTRIBUTING.md` に追加（テンプレート使用、lint/validate の手順） — `docs/CONTRIBUTING.md`
- [ ] T022 [P] `specs/001-restructure-docs/migration-plan.md` の結果をまとめ、`specs/001-restructure-docs/results/` 配下に移行ログを保存 — `specs/001-restructure-docs/results/migration-log.md`

---

## 依存関係（ユーザーストーリーの完了順）

1. Phase1 (T001〜T004) が完了するとローカルでの検証と CI が使えるようになる。
2. Phase2 (T005〜T008) が完了するとテンプレートとスキーマが揃い、移行の雛形が整う。
3. US1 (T009〜T013, P1) を最初に完了し、小さな移行パイロットを通じてワークフローを実証する（MVP）。
4. US2 (T014〜T016, P2) は US1 の成果を利用して探索性を改善する。
5. US3 (T017〜T019, P3) は所有者リストと運用テンプレートを使って継続的なメンテナンスを確立する。
6. Final (T020〜T022) は上記の成果を統合して QA と記録を完了する。

---

## 並列実行の例

- [P] タグが付いているタスクは別ファイルの作業であり、同時に担当者を割り当て可能（例: `T001`, `T002`, `T005`, `T006` は並行して実施可能）。
- US1 内の `T009`（テンプレート修正）と `T012`（パイロット移行）は連続性があるため直列実行が望ましい。

---

## 各ユーザーストーリーの独立テスト基準（短縮）

- **US1**: パイロット移行 PR がマージされ、`docs/` 配下に1つの移行済みドキュメントが存在し、`docs:validate` が成功すること。 — 検証ファイル: `specs/001-restructure-docs/migration-plan.md` と PR
- **US2**: 新規メンバー探索タスクを使い、指定ドキュメントへ 30 秒以内に到達できる手順が `docs/index.md` に記載されていること。 — 検証ファイル: `docs/index.md`
- **US3**: `specs/001-restructure-docs/owners.md` に所有者が記載され、レビュー用テンプレートで 1 回のレビューが完了していること。 — 検証ファイル: `specs/001-restructure-docs/checklists/review-template.md`

---

## 実装戦略（MVP 優先）

- MVP: Phase1 + Phase2 + US1 の最小セット（`T001`〜`T013`）でまず動くワークフローと CI を用意し、1 件の移行パイロットを完了してフィードバックを得る。
- インクリメンタル: MVP 後に US2, US3 を進め、Final で CI とドキュメントの記録を完成させる。

---

## 生成物の配置

- 生成するタスクファイル: `specs/001-restructure-docs/tasks.md`（このファイル）
- 関連ファイル例: `docs/templates/doc-template.md`, `.github/workflows/docs-validate.yml`, `specs/001-restructure-docs/migration-plan.md`, `specs/001-restructure-docs/owners.md`

---

## 付録: 参考（抽出したドキュメント）

- `specs/001-restructure-docs/plan.md` — 実装計画（技術スタック: Node/TypeScript、remark/prettier を推奨）
- `specs/001-restructure-docs/spec.md` — ユーザーストーリー（US1= P1, US2= P2, US3= P3）
- `specs/001-restructure-docs/data-model.md` — Document エンティティ定義
- `specs/001-restructure-docs/contracts/doc-metadata.schema.json` — メタデータスキーマ
- `specs/001-restructure-docs/contracts/doc-template.md` — ドキュメントテンプレート（原本）
