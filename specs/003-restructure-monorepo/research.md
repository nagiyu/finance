# Research: 技術決定と理由（Phase 0）

この文書は、`plan.md` に記載した「NEEDS CLARIFICATION」を解消するための調査結果と、採用する技術選定の決定・理由・代替案を日本語でまとめたものです。

## Decision: インフラは CloudFormation を採用

- 決定: GitHub Actions から実行する IaC は **AWS CloudFormation（テンプレート/YAML）** を採用する。
- 理由: ユーザーの指示（"AWS リソースは CloudFormation を使う"）に従うため。CloudFormation は AWS ネイティブでサポートが厚く、既存の GitHub Actions から `aws-cli` / `aws cloudformation deploy` で実行しやすい。
- 代替案: Terraform（マルチクラウド）や CDK（TypeScript で記述）を検討したが、運用方針として CloudFormation 指定が優先されるため採用しない。

## Decision: ビジネスロジックは変更しない

- 決定: ファイル移動や構成整理は行うが、既存の `finance` 等のビジネスロジックは修正しない。
- 理由: 要求仕様に明記（"ビジネスロジックは変更しないこと"）。これによりリスクを最小化する。
- 代替案: ロジックのリファクタリングは将来の別タスクで計画する。

## Decision: 言語・ランタイム・依存関係

- 決定: Node.js 20.x、TypeScript 5.x、`strict` を有効化。クライアントは Next.js を前提。
- 理由: リポジトリ内に TypeScript と Next.js が既に存在するため。`typescript-common` と `nextjs-common` の利用は憲章に沿って優先的に行う。
- 代替案: Node 20 等も可能だが、CI 互換性の観点で 18.x をデフォルトにする。

## Decision: テストツールチェーン

- 決定: ユニット / 統合テストは `jest`、E2E は `playwright` を推奨。CI 上で全テストを実行する。
- 理由: `jest` は既存 TypeScript プロジェクトで広く使われており設定が容易。E2E に Playwright を採用することでクロスブラウザ検証が可能。
- 代替案: Cypress（E2E）や Vitest（ユニット）も候補だが、互換性と既存の設定を考慮してまずは Jest/Playwright を標準とする。

## Decision: 共通サブモジュールの利用方針

- 決定: `typescript-common` と `nextjs-common` を可能な限り再利用する。互換性問題がある場合は、該当モジュールだけ一時的なラッパーを作成して移行計画を添付する。
- 理由: 憲章に従うことで重複を避け、一貫性を確保するため。
- 代替案: サブモジュール未使用を選ぶ場合は正当な理由と移行計画を文書化する。

## Decision: CI/CD とデプロイフロー

- 決定: GitHub Actions を継続利用し、デプロイワークフロー内で CloudFormation を実行して必要リソースを作成・更新する。デプロイは完全自動化（手動介入不要）を目標とする。
- 理由: 既存のワークフローが GitHub Actions であること、及び要求仕様で自動化が求められているため。
- 実装メモ: 新規スタック作成や既存の更新を含め、必要な IAM 権限は限定的なサービスロールで実行する。ワークフロー上での機密情報は GitHub Secrets を利用する。

## Decision: パフォーマンス目標

- 決定: 新規環境のデプロイ（ワークフロー開始→利用可能）を 15 分以内、CI ビルド時間を目標 15 分未満とする（現状で困難な場合は段階的改善）。
- 理由: Spec の Success Criteria に合わせた可測目標。
- 代替案: 大規模リポジトリの場合はキャッシュや分割ビルドを導入して段階的に短縮する。

## Implementation implications (導入影響)

- CloudFormation テンプレートを `infra/cloudformation/` に配置する提案。
- GitHub Actions ワークフローは `./.github/workflows/deploy.yml` を更新し、`aws cloudformation deploy` ステップを追加する。
- ルートに一本化した `devcontainer` と環境セットアップ手順を `quickstart.md` にまとめる。
- 既存のサブディレクトリに残る古い DevContainer/設定ファイルは移行後に削除する。

## Alternatives considered（検討した代替案）

- CDK/Terraform を検討したが、要件で CloudFormation 指定があるため今回は採用せず。将来的には CDK で CloudFormation を生成するパターンを検討可能。
- Vitest / Cypress を代替として検討。既存環境との互換や学習コストを考慮し、まずは Jest/Playwright を推奨。

## Conclusion / Next Steps

1. `research.md` を本ファイルとして保存（完了）。
2. Phase 1: `data-model.md`、`contracts/`（OpenAPI スケルトン）、`quickstart.md` を作成する。
3. `.specify/scripts/bash/update-agent-context.sh copilot` を実行してエージェントコンテキストを更新する（Phase 1 の一部）。


