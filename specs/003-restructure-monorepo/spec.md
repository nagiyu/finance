# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`  
**Created**: [DATE]  
**Status**: Draft  
**Input**: User description: "$ARGUMENTS"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - [Brief Title] (Priority: P1)

```markdown
# Feature Specification: リポジトリ構成の再編と開発環境の改善

**Feature Branch**: `003-restructure-monorepo`  
**Created**: 2025-11-28  
**Status**: Draft  
**Input**: ユーザー説明: "大規模リファクタリングを行う。主に使用しているのは finance, client, server 配下になるが、フォルダの名称からも機能を推察しにくい。また、DevContainer 用の古いファイルが各機能の配下に残っていたり、GitHub Actions で AWS へのデプロイは自動化されているも、リソースは手動作成になっており利便性が悪い。今後の開発やリファクタリングがやりやすいような構成にする。なお、Spec Kit の成果物は日本語で作成してください。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 開発者の初期セットアップが簡単にできる (Priority: P1)

新しい開発者がリポジトリをクローンしてから、ローカルでビルド・テスト・開発用環境を起動できること。

**Why this priority**: 新しい機能開発やレビューの効率に直結するため最優先。

**Independent Test**: 指定の手順に従ってセットアップを行い、30分以内に開発用環境が起動し、既存の主要テストが実行できることを確認する。

**Acceptance Scenarios**:

1. **Given** リポジトリをクローンした状態、 **When** 指示されたセットアップ手順を実行、 **Then** 開発用環境が起動し主要なビルドとテストが成功する。
2. **Given** 新規ブランチ作成時、 **When** CI による lint/test が実行される、 **Then** 問題があれば PR が失敗となる。

---

### User Story 2 - リポジトリ構成が明確で保守しやすい (Priority: P2)

`finance`、`client`、`server` など主要機能が誰が見ても意味の分かる構造に整理され、各モジュールの責務が明確になること。

**Why this priority**: 長期的な保守性と大規模リファクタリングの容易さに重要。

**Independent Test**: ドキュメント化された構成図に従ってコードの場所をたどり、主要機能が期待通りのディレクトリに存在することを確認する。

**Acceptance Scenarios**:

1. **Given** リポジトリのトップレベル、 **When** ドキュメントの構成図を見る、 **Then** 各機能が明確に分類されている。

---

### User Story 3 - デプロイ操作が自動化されている (Priority: P3)

GitHub Actions のワークフローから、デプロイに必要なクラウドリソース作成を含めた一連の操作が手動を要さず実行できること。

**Why this priority**: デプロイの再現性と開発速度向上のため必要。

**Independent Test**: 新しい環境をワークフローで作成し、手動操作なしにアプリが配置されることを確認する。

**Acceptance Scenarios**:

1. **Given** 新しい環境用の PR、 **When** デプロイワークフローを実行、 **Then** 必要なクラウドリソースが作成され、アプリがデプロイされる（手動介入なし）。

---

### Edge Cases

- 既存のサブディレクトリに対して Git 履歴を保持したまま移動する必要があるか。
- 大きなリポジトリ履歴がある場合の CI ビルド時間や容量の問題。
- 既存の外部デプロイ手順や手動で作成されたリソースとの互換性。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: リポジトリ内の主要機能（例: `finance`, `client`, `server`）を、責務が明確に分かるトップレベル構成に整理すること。変更後の構成はドキュメント化されること。
- **FR-002**: 開発用の DevContainer 等の環境定義ファイルはリポジトリ直下に一本化し、各サブディレクトリに残る古い定義は削除または統合すること。
- **FR-003**: GitHub Actions 側でデプロイに必要なクラウドリソースを自動で作成できるようにし、デプロイ手順から手動作成ステップを排除すること（具体的な IaC ツールは別途決定）。
- **FR-004**: 既存の主要ブランチ（develop 等）に対して破壊的でないこと。既存 CI が利用できる状態を維持すること。
- **FR-005**: 変更点はドキュメント（README、設計図、セットアップ手順）に反映され、オンボーディング手順が更新されること。
- **FR-006**: ファイル移動やリネームを行う際、Git 履歴を保持しない（履歴は引き継がない）。移動は単純なファイル移動で行い、必要に応じて重要箇所のみ個別対応とする。
- **FR-007**: デプロイ自動化は新規リソースの作成まで含めて自動化する（ワークフローで必要なクラウドリソースを作成できるようにする）。

### Quality & Constitution Requirements (mandatory)

- **Q-001**: 型チェックとリンティングの設定を CI で実行すること（CI が PR 時に自動実行すること）。
- **Q-002**: テスト戦略（unit / integration / e2e）の責務と配置場所を明記し、主要機能については自動テストが整備されること。
- **Q-003**: TypeScript ベースの部分については `typescript-common` の利用可否を明記し、利用しない場合は理由を記載すること。
- **Q-004**: Next.js を含むクライアント部分は `nextjs-common` を参照するか、参照しない場合はその理由を記載すること。
- **Q-005**: パフォーマンスやリソースに関する大枠の目標（例: CI ビルド時間の目標、デプロイ時間の目標）を設定すること。

### Key Entities *(include if feature involves data)*

- **モジュール/パッケージ**: リポジトリ内の論理単位（finance, client, server 等）。
- **開発環境定義**: DevContainer 等の環境定義ファイル群（一本化対象）。
- **CI/CD ワークフロー**: GitHub Actions のワークフロー定義とそれに付随するスクリプト。
- **クラウドリソース定義（IaC）**: デプロイに必要なリソースを定義するテンプレートやスクリプト（自動化対象）。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 新規開発者がドキュメントに従ってセットアップ手順を実行し、30分以内に開発環境を起動できる（オンボーディング手順で検証）。
- **SC-002**: PR 作成時に CI の lint/test が自動で実行され、問題があれば PR が失敗する（自動化の検証）。
- **SC-003**: デプロイワークフローは手動でのリソース作成を不要にし、ワークフロー開始からアプリが利用可能になるまでの時間が 15 分以内であること（新規環境の作成で検証）。
- **SC-004**: ドキュメントに記載された構成図を参照して、主要機能のコードを 3 分以内に特定できること（人による検証）。

### Assumptions

- 現行コードベースは大きく変更せず、リファクタリングはファイル移動・整理・ドキュメント整備が中心となる。
- 自動化には IaC を利用する想定だが、具体的なツール選定（CloudFormation/Terraform/CDK 等）は別途決定する。
- ビルドやテストの現行スクリプトは最小限維持し、必要に応じて CI 設定を更新する。

```
