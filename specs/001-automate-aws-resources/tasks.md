---

description: "Task list for 001-automate-aws-resources (日本語)"

---

# Tasks: AWSリソースの自動プロビジョニングとデプロイ

**入力**: 設計文書 `/specs/001-automate-aws-resources/` の `plan.md`, `spec.md`, `data-model.md`, `research.md`, `contracts/`, `quickstart.md`

## 概要
この tasks.md は、`client` と `server` の ECR / Lambda / EventBridge / CloudFront / IAM を CloudFormation と GitHub Actions で自動化するための実行可能なタスク群です。各ユーザーストーリー（US1, US2, US3）ごとに独立して実装・検証可能なタスクを整理しています。

## フォーマット注意
各タスクは必ず以下の形式を満たすこと:
- [ ] T### [P?] [US?] 説明（対象ファイルパス）

---

## Phase 1: Setup (共通準備)

- [x] T001 `Create CloudFormation directory and README` infra/cloudformation/README.md
- [ ] T002 `Create deployment scripts skeleton` scripts/deploy/deploy-stack.sh
- [ ] T003 [P] `Create GitHub Actions workflow skeleton for infra deploy` .github/workflows/deploy-infra.yml

---

## Phase 2: Foundational (全体のブロッキング前提)
目的: すべてのユーザーストーリーに必要な共通リソース（ECR、共通ポリシー、親スタック）を用意する。

- [ ] T004 [P] `Create ECR repository template (client)` infra/cloudformation/aws-resources/ecr-client.yaml
- [ ] T005 [P] `Create ECR repository template (server)` infra/cloudformation/aws-resources/ecr-server.yaml
- [ ] T006 [P] `Create common Lambda IAM Policy (common-lambda-policy)` infra/cloudformation/aws-resources/common-lambda-policy.yaml
- [ ] T007 `Create parent/main CloudFormation stack referencing core resources` infra/cloudformation/aws-resources/main-stack.yaml

---

## Phase 3: User Story 1 - CI/CD による一括プロビジョニングとデプロイ (Priority: P1) 🎯 MVP
Goal: GitHub Actions から CloudFormation を用いてインフラ作成→イメージビルド→ECR push→Lambda 更新→公開を実行できる。

**Independent Test**: 新規ブランチで GitHub Actions を実行し、CloudFormation の作成成功、ECR にイメージ存在、Lambda が指定のイメージタグを参照していることを検証する。

- [ ] T008 [US1] `Implement Lambda CloudFormation template for client (uses ECR imageUri param)` infra/cloudformation/lambda-client.yaml
- [ ] T009 [US1] `Implement Lambda CloudFormation template for server (uses ECR imageUri param)` infra/cloudformation/lambda-server.yaml
- [ ] T010 [US1] `Implement full GitHub Actions workflow to build/push images and deploy stacks` .github/workflows/deploy-infra.yml
- [ ] T011 [US1] `Add CI validation script to verify CloudFormation outputs and ECR images` scripts/ci/check-deploy-success.sh
- [ ] T012 [US1] `Update quickstart and deployment docs for CI flow` specs/001-automate-aws-resources/quickstart.md

---

## Phase 4: User Story 2 - ローカル開発者の利用 (Priority: P2)
Goal: ローカル開発者が専用 IAM 資格情報で ECR push や Lambda 更新を行えるようにする。

**Independent Test**: ローカル開発者の IAM 資格情報で `docker push` → ECR にイメージが置かれ、Lambda 更新が可能であることを確認する。

- [ ] T013 [US2] `Create IAM users CloudFormation (github-actions, local-client, local-server)` infra/cloudformation/aws-resources/iam-users.yaml
- [ ] T014 [US2] `Create IAM policy attachments / local user policies referencing common-lambda-policy` infra/cloudformation/aws-resources/local-user-policies.yaml
- [ ] T015 [P] [US2] `Document local developer workflow (push image, update lambda)` specs/001-automate-aws-resources/quickstart.md

---

## Phase 5: User Story 3 - バッチのスケジュール実行 (Priority: P2)
Goal: server の Lambda を EventBridge Scheduler で定期実行する。

**Independent Test**: スケジュールを作成→短周期で実行→CloudWatch Logs に期待するログが出力されることを確認する。

- [ ] T016 [US3] `Create EventBridge Scheduler template and target binding to server Lambda` infra/cloudformation/eventbridge-server.yaml
- [ ] T017 [US3] `Ensure CloudWatch Logs group and permissions are provisioned for server Lambda` infra/cloudformation/logs-permissions.yaml

---

-## Phase 6: Post-deploy - CloudFront (実行順: Lambda とスケジュール実行の後)
Goal: CloudFront の配備は Lambda のデプロイと EventBridge スケジュールの検証が完了した後に実施する。

- [ ] T018 [US1] `Create CloudFront Distribution template for client and reference ACM in us-east-1` infra/cloudformation/cloudfront-client.yaml

---

## Phase N: Polish & Cross-Cutting Concerns
- [ ] T019 [P] `Add README and usage docs for ops (ACM/us-east-1 note, delete/recreate guidance)` specs/001-automate-aws-resources/README.md
- [ ] T020 `Create tasks.md (this file)` specs/001-automate-aws-resources/tasks.md
- [ ] T021 [P] `Security review: ensure IAM policies are least-privilege (document findings)` docs/security/aws-iam-review.md
- [ ] T022 `Add automated CI checks: CloudFormation linting and template validation` .github/workflows/validate-cfn.yml

---

## 依存関係 (Dependencies & Execution Order)
- Phase 1 (Setup) → Phase 2 (Foundational) が完了後、各 User Story を実装可能。
- US1 (P1) は Foundational 完了後に開始可能。US2/US3 は US1 と並行または後続で実施可能。

## 並列実行の例
- `T004` と `T005`（ECR templates）は完全に並列で作業可能 [P]。
- `T006`（共通ポリシー）と `T004`/`T005` は並列化可能 [P]。
- ユーザーストーリー実装（T008..T012 vs T013..T015 vs T016..T017）は Foundational 完了後、チームにより並列実施可能。

## 実装戦略（推奨）
- MVP: まず `Phase 1` と `Phase 2` を完成させ、続いて `US1` を実装して CI での一括デプロイが動作することを確認する（ここが MVP）。
- 次に `US2`（ローカル開発者向け IAM）を実装し、最後に `US3`（EventBridge スケジュール）を追加する。各フェーズごとに独立してテストを実行すること。

## タスク集計サマリ
- 総タスク数: 22
- 各ユーザーストーリー別タスク数:
    - US1: 6
    - US2: 3
    - US3: 2
- 並列化の候補: T004, T005, T006, T015, T018, T021 など（[P] マークあり）

## 独立テスト基準（各 User Story）
- US1: GitHub Actions 実行で CloudFormation 作成成功、ECR にイメージ存在、Lambda が期待タグで起動すること。
- US2: ローカル IAM 資格情報で ECR push と Lambda 更新が可能であること。
- US3: EventBridge Scheduler で server Lambda が起動し、CloudWatch にログが出力されること。

## MVP 推奨スコープ
- 推奨 MVP: User Story 1 のみ（Phase1 + Phase2 + US1 実装）。

## 形式検証
- すべてのタスクは `- [ ] T### [P?] [US?] 説明（ファイルパス）` の厳密なチェックリスト形式に従っています。

---

生成者: Spec Kit 自動生成（日本語）

