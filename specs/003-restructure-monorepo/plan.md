# Implementation Plan: リポジトリ構成の再編とデプロイ自動化

**Branch**: `003-restructure-monorepo` | **Date**: 2025-11-28 | **Spec**: `/specs/003-restructure-monorepo/spec.md`
**Input**: Feature specification from `/specs/003-restructure-monorepo/spec.md`

## Summary

この実装計画は、リポジトリのトップレベル構成（`finance`、`client`、`server` 等）の整理、開発環境定義の一本化、及び GitHub Actions から AWS リソースの作成を含むデプロイ自動化（CloudFormation 利用）を目的とします。ビジネスロジック自体は変更せず、ファイル移動・ドキュメント整備・CI ワークフローの更新を中心に進めます。

## Technical Context

**Language/Version**: Node.js 20.x / TypeScript 5.x (`strict` を有効)  
**Primary Dependencies**: Next.js (client)、TypeScript、`typescript-common`、`nextjs-common`、Jest、ESLint/Prettier、GitHub Actions  
**Storage**: 特定の DB 変更は行わない（ストレージは現状準拠、インフラは AWS CloudFormation テンプレートで管理）  
**Testing**: ユニット/統合は `jest`、E2E は `playwright`（必要に応じて導入）  
**Target Platform**: Linux ベースの CI と AWS（デプロイ先）  
**Project Type**: Monorepo（トップレベルに `finance`、`client`、`server` を維持）  
**Performance Goals**: 新規環境構築（ワークフロー開始→利用可能）を 15 分以内、CI ビルド時間は目標 15 分未満（現状の大きさに依存）  
**Constraints**: ビジネスロジックは変更しない。AWS リソース定義は CloudFormation を使用すること（本プランの要件）。  
**Scale/Scope**: リポジトリ既存のコードベース（多数の TypeScript モジュール、Next.js クライアント、サービス群）を想定

## Constitution Check

この計画は `.specify/memory/constitution.md` の必須要件に従います。主要な適合点は以下の通りですn

- **型安全とリンティング**: TypeScript の `strict` を有効化、ESLint/Prettier を CI に組み込みます。
- **テスト戦略**: ユニット（Jest）・統合（Jest）を必須とし、ユーザーに影響する主要フローに対しては Playwright による E2E を推奨します。PR で CI が走るように設定します。
- **UX/アクセシビリティ**: クライアント側の UI 変更は原則行わないため、大きな UX 影響はありません。将来的な UI 変更時は受け入れテストとアクセシビリティ基準（WCAG）を適用します。
- **パフォーマンス / リソース予算**: 新規環境構築とデプロイ時間の目標を設け、CI ビルド時間の目標を文書化します（上記 Performance Goals）。
- **共通サブモジュールの利用**: `typescript-common` と `nextjs-common` を可能な限り再利用します。現状の互換性問題があれば別途記載して合意を得ます。

この計画は憲章の必須項目を満たすため、現時点での重大な違反はありません（GATE: 通過）。

## Project Structure

### Documentation (this feature)

```text
specs/003-restructure-monorepo/
├── plan.md              # 本ファイル
├── research.md          # Phase 0 出力（本プランで生成）
├── data-model.md        # Phase 1 出力
├── quickstart.md        # Phase 1 出力
├── contracts/           # Phase 1 出力（OpenAPI 等のスケルトン）
└── tasks.md             # Phase 2 出力（/speckit.tasks）
```

### Source Code (repository root)

選択: Monorepo のままトップレベル整理を行う（破壊的変更は行わない）。現状のディレクトリを基本に、個々の小さなファイル単位で不要に DevContainer を作成しないよう整理します。ルートに複数の DevContainer 設定を置くことや、各プロジェクトごとの DevContainer の存在は許容しますが、散在する古い定義は移行・整理の対象とします。

``text
finance/    # 現行の finance 関連実装を維持
client/     # Next.js クライアント (nextjs-common 参照)
server/     # サーバー/API 実装
common/     # 共通ドキュメントやスクリプト（typescript-common の利用を明記）
```

**Structure Decision**: 既存の主要フォルダ名を維持し、ルートに共通の DevContainer / CI 設定を配置する。個別サブフォルダに残っている古い定義は削除または統合する。

## Complexity Tracking

現時点で憲章に対する重大な違反は検出されていないため、特別な複雑性トラッキング表は不要です。

