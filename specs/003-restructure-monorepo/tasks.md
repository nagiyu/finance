---
description: "Task list for リポジトリ構成の再編とデプロイ自動化"
---

# Tasks: リポジトリ構成の再編とデプロイ自動化

**Input**: Design documents from `specs/003-restructure-monorepo/`

## Constitution Check
- **型チェック / リンティング**: TypeScript `strict` を有効とし、各コンポーネント（`finance`, `client/finance`, `server`）ごとに `package.json` の `typecheck` / `lint` スクリプトを保持する。CI は各プロジェクトのスクリプトを個別に呼び出す設計とする。
- **テスト戦略**: ユニット/統合は `jest`、E2E は `playwright` を想定。各コンポーネント単位で `npm test` を実行できるようにし、CI で個別ジョブとして実行する。
- **開発環境（DevContainer）方針**: クライアント・サーバーでビルド環境が異なるため、ルート直下の `.devcontainer/<component>/devcontainer.json` 形式でコンポーネント別に DevContainer を管理する（例: `.devcontainer/client/devcontainer.json`, `.devcontainer/server/devcontainer.json`）。サブディレクトリ直下に `.devcontainer` を残さない方針とする。
- **UX / 受け入れ条件**: Quickstart に従って 30 分以内に各主要コンポーネントの開発サーバが起動し、主要テストが実行できることを検証する。関連ファイル: specs/003-restructure-monorepo/quickstart.md
- **パフォーマンス目標**: 新規環境デプロイ 15 分以内、CI ビルド 15 分未満を目安とする。
- **共通モジュールの利用**: `typescript-common` と `nextjs-common` を可能な限り再利用する。再利用しない場合は理由を docs/ を通じて明記する。

## 生成ルールと注意
- 各タスクはユーザーストーリーごとに整理され、独立して実装/テスト可能であること。
- タスク行は必ず次の形式に従うこと:

```text
- [ ] T### [P?] [US?] 説明（ファイルパス）
```

---

## Phase 1: Setup (共有インフラ／コンポーネント分離を前提)

- [ ] T001 [P] 各コンポーネント用 DevContainer 設定をルート直下 `.devcontainer/<component>/devcontainer.json` 形式で作成/整備する（例: .devcontainer/client/devcontainer.json, .devcontainer/server/devcontainer.json, .devcontainer/finance/devcontainer.json）
- [ ] T002 [P] 各コンポーネントの `package.json` に `typecheck` / `lint` / `test` / `setup` スクリプトを整備する（client/finance/package.json, server/package.json, finance/package.json）
- [ ] T003 [P] ルートと各コンポーネントで ESLint/Prettier 設定を調整し、共通ルールはルートにまとめつつプロジェクト毎の上書きを許容する（.eslintrc.cjs/.prettierrc, client/finance/.eslintrc.js, server/.eslintrc.js）
- [ ] T004 [P] Quickstart を検証・補強して `specs/003-restructure-monorepo/quickstart.md` に各コンポーネントの起動手順と推奨 DevContainer（`.devcontainer/<component>/devcontainer.json`）利用法を反映する（specs/003-restructure-monorepo/quickstart.md）
- [ ] T005 [P] 既存サブディレクトリに残る legacy DevContainer や古い環境定義を検索し一覧を作成する（specs/003-restructure-monorepo/legacy-devcontainer-list.md）

---

## Phase 2: Foundational (ブロッキング前提)

※ すべてのユーザーストーリーはこのフェーズ完了後に着手可能

- [ ] T006 CI ワークフロー（各コンポーネント向けの lint/typecheck/test ジョブを含む）を追加する（.github/workflows/ci-root.yml, .github/workflows/ci-client.yml, .github/workflows/ci-server.yml）
- [ ] T007 デプロイ用ワークフローを追加する（CloudFormation 実行を含む）（.github/workflows/deploy.yml）
- [ ] T008 基本的な CloudFormation テンプレートのスケルトンを作成する（infra/cloudformation/base-stack.yml）
- [ ] T009 デプロイ用スクリプト（aws CLI 実行ラッパー）を作成する（scripts/deploy/deploy_stack.sh）
- [ ] T010 ルート README と quickstart のリンクを整備する（README.md / specs/003-restructure-monorepo/quickstart.md）

---

## Phase 3: User Story 1 - 開発者の初期セットアップが簡単にできる (Priority: P1) 🎯 MVP

**Goal**: 新規開発者が 30 分以内にローカルで主要コンポーネント（`finance`, `client/finance`, `server`）のビルド・テスト・開発用環境を起動できるようにする。

**Independent Test**: `specs/003-restructure-monorepo/quickstart.md` の手順に従い、各コンポーネントで `npm run typecheck` と `npm test` が成功すること。

- [ ] T011 [US1] Quickstart を確定し、各コンポーネントのセットアップ/起動手順を `specs/003-restructure-monorepo/quickstart.md` に反映する（specs/003-restructure-monorepo/quickstart.md）
- [ ] T012 [P] [US1] 各コンポーネントの `package.json` に `setup` スクリプトを追加/整備する（client/finance/package.json, server/package.json, finance/package.json）
- [ ] T013 [US1] 各コンポーネント用 DevContainer 利用手順を README に追加する（finance/README.md, client/finance/README.md, server/README.md）
- [ ] T014 [P] [US1] 開発環境起動を検証するセルフチェックスクリプトを追加し、コンポーネント単位でのビルド検証を行う（scripts/check-quickstart.sh）
- [ ] T015 [US1] 主要テスト（`npm test`）が CI で成功することを確認するためのワークフロー設定を完成させる（.github/workflows/ci-root.yml, .github/workflows/ci-client.yml, .github/workflows/ci-server.yml）

---

## Phase 4: User Story 2 - リポジトリ構成が明確で保守しやすい (Priority: P2)

**Goal**: `finance`, `client`, `server` 等の責務を明確化し、コンポーネント毎のビルド・依存関係・起動手順をドキュメント化する。

**Independent Test**: ドキュメント `docs/structure.md` を参照して、主要機能の実装箇所を 3 分以内に特定できること。各コンポーネントの `package.json` に記載されたスクリプトでビルド/テストが実行できること。

- [ ] T016 [US2] ドキュメント `docs/structure.md` を作成し現在のモジュール配置と責務を記述する（docs/structure.md）
- [ ] T017 [P] [US2] 各モジュール（finance, client/finance, server）の README を整備し責務と起動手順を追記する（finance/README.md, client/finance/README.md, server/README.md）
- [ ] T018 [US2] ワークスペース定義（pnpm-workspace.yaml など）やルートの集合的ドキュメントを追加し、各コンポーネントの依存ルールを明記する（pnpm-workspace.yaml または該当）
- [ ] T019 [US2] 古い無秩序な設定ファイルを移動または削除する PR を作成する（対象は specs/003-restructure-monorepo/legacy-devcontainer-list.md に基づく）

---

## Phase 5: User Story 3 - デプロイ操作が自動化されている (Priority: P3)

**Goal**: GitHub Actions から CloudFormation を実行して新規環境の作成・更新を自動化する。

**Independent Test**: 新規スタックをワークフローで作成し、手動操作なしに最小限のリソースが作成されること。

- [ ] T020 [US3] `infra/cloudformation/base-stack.yml` を完成させ、最小限の VPC/Role/Outputs を定義する（infra/cloudformation/base-stack.yml）
- [ ] T021 [P] [US3] デプロイワークフローで `aws cloudformation deploy` を実行するステップを実装する（.github/workflows/deploy.yml）
- [ ] T022 [US3] ワークフロー用の Secrets / 権限設定手順を `docs/deploy.md` に記載する（docs/deploy.md）
- [ ] T023 [US3] デプロイ手順のエンドツーエンド検証スクリプトを `scripts/deploy/validate_deploy.sh` に追加する（scripts/deploy/validate_deploy.sh）

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T024 [P] ドキュメント統合: `docs/` 以下に移行ガイドと変更点をまとめる（docs/migration.md）
- [ ] T025 [P] CI で Quickstart の手順を検証するジョブを追加する（.github/workflows/validate-quickstart.yml）
- [ ] T026 [P] ルート README と各サブプロジェクト README の整合性をとる（README.md, finance/README.md, client/finance/README.md）
- [ ] T027 [P] セキュリティ/権限レビューのチェックリストを追加する（docs/security-checklist.md）

---

## Dependencies & 実行順序

- Setup (Phase 1) → Foundational (Phase 2) が完了してから各 User Story (Phase 3+) に着手可能。
- User Story は原則として Foundational 完了後に並列で実装可能（チームの割当次第）。
- デプロイ自動化 (US3) は infra とワークフローの実装を含むため Foundational に強く依存する。

### ユーザーストーリー優先順（実行順）
- US1 (P1) → US2 (P2) → US3 (P3)

---

## 並列実行例

- `T001`, `T002`, `T003` は並列実行可能（DevContainer/スクリプト/ESLint は独立ファイル）。
- Foundational の `T006`, `T007`, `T008` は互いに並列可能だが、`T007`（CloudFormation）と `T009`（デプロイスクリプト）は組み合わせて検証することを推奨。
- US1 の `T012` と US2 の `T017` は別チームで同時進行可能。

---

## 実装戦略（MVP 優先）

1. Phase 1 と Phase 2 を最小限で完了させる（T001〜T010）。
2. Phase 3 (US1) を完了させてオンボーディングの検証を行う（T011〜T015）。これを MVP とする。
3. US2 を実装して構成図・ドキュメントを整備する（T016〜T019）。
4. US3 (デプロイ自動化) を実装・検証する（T020〜T023）。
5. 最後に Phase 6 でドキュメントとセキュリティなど横断的な改善を行う（T024〜T027）。

---

Generated-by: speckit.tasks
