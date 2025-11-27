# ドキュメント所有者一覧

**Feature Branch**: `001-restructure-docs`  
**Created**: 2025-11-27  
**Last Updated**: 2025-11-27  
**Status**: Active

## 概要

このドキュメントは、リポジトリ内の主要ドキュメントに対する所有者（owner）のマッピングを記載します。所有者は該当ドキュメントの正確性、最新性を維持する責任を持ちます。

## 所有者の責務

- 担当ドキュメントの正確性を定期的に確認する
- コード変更に伴うドキュメント更新を行う
- 月次レビューを実施し、必要な更新を完了する
- 他の開発者からのドキュメント改善提案をレビューする

## ドキュメント所有者マッピング

### docs/ 配下の主要ドキュメント

| ドキュメントID | パス | 所有者 | 領域 | ステータス |
|---------------|------|--------|------|-----------|
| DOC-001 | `docs/index.md` | @nagiyu | 全体 | active |
| DOC-002 | `docs/finance/README.md` | @nagiyu | finance | active |
| DOC-003 | `docs/finance/MyTicker.md` | @nagiyu | finance | active |
| DOC-004 | `docs/finance/conditions-system.md` | @nagiyu | finance | active |
| DOC-005 | `docs/finance/per-condition-frequency.md` | @nagiyu | finance | active |
| DOC-006 | `docs/finance/simplified-notification-api.md` | @nagiyu | finance | active |
| DOC-007 | `docs/finance/simplified-notification-ui.md` | @nagiyu | finance | active |
| DOC-008 | `docs/finance/sync-cache-api.md` | @nagiyu | finance | active |
| DOC-009 | `docs/finance/target-price-calculation.md` | @nagiyu | finance | active |
| DOC-010 | `docs/common/README.md` | @nagiyu | common | active |
| DOC-011 | `docs/common/authorization-architecture.md` | @nagiyu | common | active |
| DOC-012 | `docs/common/authorization-implementation-status.md` | @nagiyu | common | active |
| DOC-013 | `docs/common/client-authorization-implementation-summary.md` | @nagiyu | common | active |
| DOC-014 | `docs/client/README.md` | @nagiyu | client | active |
| DOC-015 | `docs/guides/index.md` | @nagiyu | guides | active |
| DOC-016 | `docs/guides/google-adsense.md` | @nagiyu | guides | active |
| DOC-017 | `docs/templates/doc-template.md` | @nagiyu | templates | active |
| DOC-018 | `docs/contracts/doc-metadata.schema.json` | @nagiyu | contracts | active |
| DOC-019 | `docs/settings/baseSetting.md` | @nagiyu | settings | active |

### specs/ 配下の主要ドキュメント

| ドキュメントID | パス | 所有者 | 領域 | ステータス |
|---------------|------|--------|------|-----------|
| SPEC-001 | `specs/001-restructure-docs/spec.md` | @nagiyu | spec | active |
| SPEC-002 | `specs/001-restructure-docs/plan.md` | @nagiyu | spec | active |
| SPEC-003 | `specs/001-restructure-docs/tasks.md` | @nagiyu | spec | active |
| SPEC-004 | `specs/001-restructure-docs/data-model.md` | @nagiyu | spec | active |
| SPEC-005 | `specs/001-restructure-docs/migration-plan.md` | @nagiyu | spec | active |
| SPEC-006 | `specs/001-restructure-docs/quickstart.md` | @nagiyu | spec | active |
| SPEC-007 | `specs/001-restructure-docs/research.md` | @nagiyu | spec | active |
| SPEC-008 | `specs/001-restructure-docs/contracts/doc-template.md` | @nagiyu | spec | active |
| SPEC-009 | `specs/001-restructure-docs/contracts/doc-metadata.schema.json` | @nagiyu | spec | active |

### ルートレベルのドキュメント

| ドキュメントID | パス | 所有者 | 領域 | ステータス |
|---------------|------|--------|------|-----------|
| ROOT-001 | `README.md` | @nagiyu | root | active |
| ROOT-002 | `CODEOWNERS` | @nagiyu | root | active |

## 領域別所有者サマリー

| 領域 | 主要所有者 | ドキュメント数 |
|------|-----------|--------------|
| finance | @nagiyu | 8 |
| common | @nagiyu | 4 |
| client | @nagiyu | 1 |
| guides | @nagiyu | 2 |
| templates | @nagiyu | 1 |
| contracts | @nagiyu | 1 |
| settings | @nagiyu | 1 |
| spec | @nagiyu | 9 |
| root | @nagiyu | 2 |

## レビュースケジュール

- **月次レビュー**: 毎月第1週に所有ドキュメントの確認を実施
- **四半期レビュー**: 3ヶ月ごとに全ドキュメントの構造レビューを実施

## 所有者変更履歴

| 日付 | ドキュメントID | 変更内容 | 理由 |
|------|---------------|---------|------|
| 2025-11-27 | 全件 | 初期登録 | 所有者一覧の作成 |

## 参考資料

- [仕様書](./spec.md)
- [移行計画](./migration-plan.md)
- [ドキュメントテンプレート](./contracts/doc-template.md)
- [要件チェックリスト](./checklists/requirements.md)
