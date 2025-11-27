---
title: "<Title>"
area: finance
topic: <topic>
owner: @your-handle
last-updated: 2025-11-27
related-code-paths:
    - "finance/services/MyTickerService.ts"
status: active
---

# フロントマター説明

このドキュメントでは、ドキュメントの先頭に記載するフロントマターの必須フィールドについて説明します。

## 必須フィールド

| フィールド名 | 説明 | 例 |
|------------|------|-----|
| `title` | ドキュメントのタイトル | `"API リファレンス"` |
| `area` | ドキュメントが属する領域・ドメイン | `finance`, `common`, `client` |
| `topic` | ドキュメントのトピック・カテゴリ | `api`, `guide`, `architecture` |
| `owner` | ドキュメントオーナーの GitHub ハンドル | `@your-handle` |
| `last-updated` | 最終更新日（YYYY-MM-DD 形式） | `2025-11-27` |
| `related-code-paths` | 関連するコードパスのリスト | `- "finance/services/MyTickerService.ts"` |
| `status` | ドキュメントのステータス | `active`, `draft`, `deprecated` |

## 使用例

```yaml
---
title: "株価取得サービス設計書"
area: finance
topic: api
owner: @nagiyu
last-updated: 2025-11-27
related-code-paths:
    - "finance/services/TickerService.ts"
    - "finance/models/Ticker.ts"
status: active
---
```

---

# 目的

このドキュメントの目的を記述してください。

# 前提条件

- 必要な環境や前提事項

# 手順

1. ステップ1
2. ステップ2

# テスト / 検証

変更を検証する方法を記述してください。
