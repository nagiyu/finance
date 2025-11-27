---
name: Documentation Update
about: ドキュメント更新用のテンプレート
title: ""
labels: ["documentation"]
assignees: []
---

## 概要 (Summary)
変更内容を簡潔に記載してください。

---

## ドキュメント更新チェックリスト (Documentation Update Checklist)

### 必須項目

- [ ] フロントマター（メタデータ）が正しく記載されている
  - [ ] `title` が適切に設定されている
  - [ ] `area` が正しく指定されている（例: finance, common, contracts, guides）
  - [ ] `topic` が適切に設定されている
  - [ ] `owner` が設定されている
  - [ ] `last-updated` が更新日に設定されている
  - [ ] `related-code-paths` が関連コードパスを含んでいる（該当する場合）
  - [ ] `status` が設定されている（active, deprecated, draft）

- [ ] ドキュメントテンプレートに従っている（`docs/templates/doc-template.md` 参照）

- [ ] ドキュメントの配置場所が適切である
  - [ ] 適切なエリアディレクトリ配下に配置されている（例: `docs/finance/`, `docs/guides/`）

### 内容確認

- [ ] 目的（Purpose）が明確に記載されている
- [ ] 前提条件が記載されている（該当する場合）
- [ ] 手順が具体的で分かりやすい
- [ ] テスト/検証方法が記載されている（該当する場合）

### 品質確認

- [ ] 日本語として読みやすい文章である
- [ ] リンクが正しく動作する
- [ ] コードブロックが適切にフォーマットされている
- [ ] 画像やダイアグラムが含まれている場合、適切に表示される

### CI/ローカル検証

- [ ] `npm run docs:lint` がパスする（該当する場合）
- [ ] `npm run docs:validate` がパスする（該当する場合）

---

## 関連ドキュメント (Related Documents)
関連するドキュメントやリンクがあれば記載してください。

---

## レビュア向けメモ (Notes for Reviewers)
レビュー時に注目してほしい点や質問があれば記載してください。
