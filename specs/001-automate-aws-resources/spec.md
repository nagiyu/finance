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
# Feature Specification: AWS リソース作成とデプロイ自動化

**Feature Branch**: `001-automate-aws-resources`  
**Created**: 2025-11-29  
**Status**: Draft  
**Input**: User description: "本リポジトリの client、server (バッチ) のリソース作成、デプロイを自動化する。現状、デプロイは自動化されているが、手動で作成したリソースに対してしかできていない。そこで、既存のリソースは一度破棄し、新たにリソース作成から自動化し、自動で作成したリソースに対してデプロイできるようにする。リソースは AWS に対して作成するものとする。ただし、方式は既存のまま維持するため、ECR を作成し、そこにデプロイし、その ECR をもとに Lambda を起動できるようにする (client, server 共通)。また、client は関数 URL で公開する。また、server (バッチ) の Lambda は定期的に動作するよう、EventBridge Scheduler のリソースも作成し、紐づける。さらに、IAM のユーザーも3種類作成する。GitHub Actions 用は GitHub Actions から Cloud Formation でデプロイできるユーザーで、適切なロールを付与する。残りの2つはローカルで開発を行うためのユーザーで、client 用と server 用を作成する。ロールはポリシーを別途作成し、client、server の Lambda と同じポリシーを適用する。そうすることで、Lambda とローカル開発ユーザーのロール (ポリシー) を一括管理できるようにしたい。最後に、client で公開する Lambda については、最終的に外部のクラウドサービスの DNS と紐づけられるようにするため、Cloud Front もリソースとして作成する。なお、ACM は発行済みとする。また、本 Spec Kit で生成する成果物については日本語で作成すること."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - CI/CD による一括プロビジョニングとデプロイ (Priority: P1)

開発運用担当者は、既存のデプロイ手順（GitHub Actions / CloudFormation ベース）を用いて、リポジトリからインフラ作成→イメージビルド→ECR へのプッシュ→Lambda 更新→公開までを自動で実行できる。

**Why this priority**: 現状は手動で作成したリソースに対してのみデプロイ可能であり、自動化の最大の価値は CI から新規プロビジョニング・デプロイまでを自動化することにある。

**Independent Test**: 新規作成されたブランチ上で GitHub Actions をトリガーし、出力の JSON と CloudFormation の成功、ECR にイメージが存在すること、Lambda が期待のイメージタグで起動していることを確認する。

**Acceptance Scenarios**:

1. **Given**: AWS アカウントに既に手動で削除済みの前提の状態、**When**: CI を実行してプロビジョニングを行う、**Then**: すべての対象リソース（ECR、Lambda、EventBridge Scheduler、CloudFront、IAM ユーザー/ポリシー）が CloudFormation（または既存の方式）で作成され、デプロイが成功する。
2. **Given**: 上記後、**When**: client 用エンドポイント（CloudFront 経由）に簡易ヘルスチェック GET を送信、**Then**: 200 OK が返り、関数が正常に応答する。

---

### User Story 2 - ローカル開発者の利用 (Priority: P2)

ローカルで開発する開発者は、専用に作られた IAM ユーザー（client 用 / server 用）を用いてローカルから ECR へのプッシュや Lambda 実行（必要な場合）を行える。

**Why this priority**: ローカルでの開発・デバッグができないと開発効率が落ちるため

**Independent Test**: ローカル開発者アカウントの認証情報で ECR へイメージをプッシュし、Lambda を更新できることを確認する。

**Acceptance Scenarios**:

1. **Given**: ローカル開発者用 IAM 資格情報、**When**: 指定の ECR リポジトリに docker push、**Then**: イメージが登録され Lambda を更新して正常に動作する。

---

### User Story 3 - バッチのスケジュール実行 (Priority: P2)

バッチ（server）の Lambda は EventBridge Scheduler により定期実行される。

**Why this priority**: バッチ処理は業務に必須であり自動化の対象であるため

**Independent Test**: スケジュール作成後、手動トリガーまたは短周期テスト実行で Lambda が実行され、ログが出力されることを確認する。

**Acceptance Scenarios**:

1. **Given**: 作成されたスケジュール、**When**: スケジュールがトリガーされる、**Then**: Lambda が実行され期待されるログが CloudWatch に出力される。

---


### Edge Cases

- IAM ポリシーが過度に広域であるとセキュリティリスクになるため、最小権限を原則とする。
- CloudFront と Function URL の組み合わせでドメイン/証明書が適切に紐づかないケース（ACM のリージョン制約など）。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: システムは client と server 用の ECR リポジトリを作成できること。
- **FR-002**: システムは ECR に対してイメージのプッシュとタグ管理が可能であること（CI/ローカルいずれも）。
- **FR-003**: システムは ECR のイメージを参照する Lambda（client, server）を作成・更新できること。
- **FR-004**: client 用 Lambda は Function URL で公開され、CloudFront ディストリビューションを作成して外部ドメイン（将来的に外部 DNS と紐づけ）で配信できること。
- **FR-005**: server 用 Lambda は EventBridge Scheduler による定期実行が設定されること（スケジュールは下記で明確化を要する）。
- **FR-006**: IAM に以下のユーザーを作成すること：①GitHub Actions 用（CloudFormation によるデプロイが可能な権限を付与）、②ローカル開発者用（client 用）、③ローカル開発者用（server 用）。
- **FR-007**: client と server の各 Lambda に対して共通のポリシーを作成し、そのポリシーを Lambda 実行ロールとローカル開発者ユーザー（必要権限分）に適用できること。
- **FR-008**: 全てのリソース作成は既存のデプロイ方式（CloudFormation ベースのワークフローを維持）で自動化できること。


### Quality & Constitution Requirements (mandatory)

- **Q-001**: 提供する IaC テンプレート（CloudFormation）とデプロイ手順は再現可能でなければならない（同一入力で資源が確実に作成できる）。
- **Q-002**: デプロイは冪等性を担保する（既存の同名リソースが存在する場合の取り扱いを定義する）。
- **Q-003**: ログ（CloudWatch Logs）とメトリクス（CloudWatch Metrics）を標準で有効化する。
- **Q-004**: セキュリティ: IAM ポリシーは最小権限を目指し、管理用ポリシーはドキュメント化される。
- **Q-005**: テスト戦略（unit/integration）は CI に組み込み、機能テストでデプロイ後のエンドポイント応答確認を含める。

### Key Entities *(include if feature involves data)*

- **ECR リポジトリ（client, server）**: イメージ格納先。
- **Lambda 関数（client, server）**: ECR イメージを参照して実行される関数。
- **Function URL（client）**: client Lambda を直接公開するためのエンドポイント。
- **CloudFront Distribution（client）**: 外部 DNS での公開に向けた配信レイヤー。ACM 証明書が既に発行済みであることを前提とする。
- **EventBridge Scheduler（server）**: server Lambda の定期実行を管理するスケジュール。
- **IAM ユーザー／ロール／ポリシー**: GitHub Actions 用ユーザー、ローカル開発者用ユーザー（client/server）、Lambda 実行ロール、および共通ポリシー。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 単一の CI 実行（または指定スクリプト）により、クラウド上で必要な全リソースが作成され、デプロイが完了するまでの時間が 15 分以内であること（環境による差は注記）。
- **SC-002**: GitHub Actions を用いたデプロイ実行後、ECR にイメージが存在し、該当 Lambda がそのイメージを参照して起動すること（70%以上の試行で成功）。
- **SC-003**: client の CloudFront 経由エンドポイントへ GET を送信し、ステータスコード 200 を受け取れること（ヘルスチェック）。
- **SC-004**: EventBridge Scheduler による server Lambda の実行がスケジュールどおりに行われ、直近実行のログが CloudWatch に出力されていること。
- **SC-005**: 作成した 3 種類の IAM ユーザーはそれぞれの目的（CI デプロイ、ローカル開発 client、ローカル開発 server）を果たせる権限を持つこと（簡易検証手順を用いて実証）。
- **SC-006**: すべてのリソースは IaC（CloudFormation）から管理でき、削除→再作成がドキュメント化されていること。

## Assumptions

- ACM 証明書は既に発行済みであり、CloudFront に紐づけ可能である（詳細は要確認）。
- AWS アカウントと必要な管理者権限（スタック作成等）が存在する。
- 既存のデプロイ方式は CloudFormation ベースであり、それを拡張する形で実装する。
- ECR 名称や Lambda 名の命名規則はリポジトリ内の従来規約に従う。


## ACM 証明書の所在と対応

既存の ACM 証明書は作業対象リージョン（例: ap-northeast-1）に存在するため、CloudFront が要するグローバル用の ACM 証明書（`us-east-1`）とはリージョンが異なります。対応方針としては、`us-east-1` に同等の ACM 証明書を追加発行して CloudFront に紐づけることを前提とします。別案として外部 TLS 終端を採る運用変更も考えられますが、本仕様では `us-east-1` に ACM を追加発行する前提で進めます。

## EventBridge Scheduler のスケジュール頻度

server（株価取得バッチ）の実行頻度は「毎分実行」とします（テスト用途では短周期を用いることがある）。運用段階ではコストと実行時間を確認して調整してください。

```
