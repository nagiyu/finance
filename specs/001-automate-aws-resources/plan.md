# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary
[概要]
本計画は、既存の CloudFormation ベースのワークフローを拡張して、`client` と `server`（バッチ）用の AWS リソース（ECR、Lambda、EventBridge Scheduler、CloudFront、IAM ユーザー/ポリシー等）を CI から一括でプロビジョニング・デプロイできるようにするものです。CI（GitHub Actions）でスタック作成→イメージビルド→ECR プッシュ→Lambda 更新→公開までを自動化します。
[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: CloudFormation (YAML), Bash/Node.js for CI scripts; TypeScript for repository services (existing) — TypeScript の具体的 `strict` 設定はリポジトリ内の該当 `tsconfig.json` を参照（現時点: 一部ファイルあり、`strict` の有効可否は `NEEDS CLARIFICATION`）。
**Primary Dependencies**: AWS CloudFormation, AWS CLI, GitHub Actions, Docker, AWS SDK (build/validation), (既存) `typescript-common` / `nextjs-common` を必要に応じて参照。
**Storage**: N/A（ECR / Lambda / CloudFront / EventBridge を利用）
**Testing**: CI によるデプロイ後の検証（CloudFormation 出力確認、ECR へのイメージ存在確認、Lambda 起動確認、client のヘルスチェック）。リポジトリのコードテストは `jest` 等（既存 `jest.config.js` を利用）。
**Target Platform**: AWS（Lambda, ECR, CloudFront, EventBridge, IAM）
**Project Type**: インフラ自動化（CloudFormation テンプレート + CI）
**Performance Goals**: 単一 CI 実行での全プロビジョニングとデプロイを 15 分以内（目標）
**Constraints**: CloudFront の ACM は `us-east-1` が必要、リージョン間の証明書制約に注意。EventBridge Scheduler の最短実行頻度やコストを運用で管理。
**Scale/Scope**: 小〜中規模のインフラ（Client/Server 各1 関数 + 関連リソース）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution チェック（このフェーズでの評価）:

- **Type safety / Linting**: 本機能は主に CloudFormation テンプレートと CI スクリプト（Bash/Node）を提供するため、直接の TypeScript 出荷物は限定的です。ただし、リポジトリ内に TypeScript サービスが存在するため、追加で TypeScript 変更を行う場合は既存の `tsconfig.json` と ESLint 設定に従う必要があります。現時点で `tsconfig.json` の `strict` 設定は `NEEDS CLARIFICATION` のため、必要に応じて `strict` の有効化を検討してください。合規性: PARTIAL (インフラ成果物は型チェックの対象外だが、コード変更は憲章に準拠することを要求)。

- **Testing Strategy**: 必須。CI フロー内で次の自動検証を実装します：CloudFormation スタック作成成功の確認、ECR にイメージが存在するかの確認、Lambda が期待のイメージタグを参照しているかの確認、client のヘルスチェック（CloudFront 経由の GET → 200）。リポジトリコードのユニット/統合テストは既存の `jest` を継続利用。合規性: PASS（テスト戦略を CI に組み込む設計を含めています）。

- **UX / Accessibility**: user-facing の `client` は Function URL と CloudFront で公開されるため、UX の観点では応答の一貫性、エラーハンドリング、基本的な可用性確認（ヘルスチェック）を受け入れ基準に含めます。アクセシビリティ (WCAG 等) はフロントエンド改修が発生する場合に適用。合規性: PASS（最小限の UX 合格基準を設けています）。

- **Performance / Resource Budgets**: デプロイ時間目標（15 分）を明記し、EventBridge の毎分スケジュールはコスト影響を運用段階で検証する必要があります。合規性: PASS（目標と運用検証を定義）。

- **Shared Submodules**: TypeScript/Next.js の変更が発生する場合は `typescript-common` / `nextjs-common` を優先利用する方針に従います。本インフラ作業自体はこれらサブモジュールに依存しないため、準拠性に問題ありません。合規性: PASS（方針に準拠）。

注: `Type safety / Linting` に関する具体的設定（`tsconfig.json` の `strict`、ルート ESLint 設定の有無など）は `NEEDS CLARIFICATION` としてフェーズ 1 の設計段階で確定します。

GATE 評価結論: フェーズ0 の要件は満たしているが、TypeScript 設定の未確定点があるためフェーズ1 で確証を得たうえで最終合格とする。

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
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

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: 本機能はインフラ（CloudFormation テンプレート）と CI スクリプトの追加・修正を行うため、ソースは既存の `deploy/cloudformation/`（想定パス）にテンプレートを置き、CI ワークフローは `.github/workflows/` を更新します。コード変更が必要な場合は既存サービス（`client/`, `server/`）の中で修正を行い、`typescript-common` / `nextjs-common` を参照します。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| TypeScript `strict` 未確認 | 既存コードベースの型安全性要件を満たすため、`strict` の有効化が望ましいが、現時点で設定が不明 | `strict` を無効にしたまま進めると型安全性が低下するため、フェーズ1 で確認し必要なら `tsconfig` を更新する計画を採る |
