# クイックスタート — ドキュメント検証と移行パイロット

1. 開発依存関係のインストール（リポジトリルートから）:

```
cd /home/yusuke/repos/finance
npm install --prefix client/finance --no-audit --no-fund || true
# 推奨: `remark-cli`, `remark-preset-lint-recommended`, `prettier` をリポジトリレベルの devDeps としてインストール
```

2. ローカルでのリンティング／検証の実行（例）:

```bash
# Markdown リンティング
npm run docs:lint

# ドキュメントメタデータスキーマの検証
npm run docs:validate
```

上記のコマンドは `package.json` の `scripts` に定義されています:
- `docs:lint`: remark を使用して Markdown ファイルのリンティングを実行
- `docs:validate`: `scripts/validate-docs.js` を実行してドキュメントメタデータスキーマを検証

3. 移行パイロット手順:
- リポジトリをスキャンして `specs/001-restructure-docs/migration-plan.md` を作成する（手動またはスクリプト）。
- 1 件の移行を適用する（ファイル移動 + frontmatter の更新 + 所有者の追加）ブランチを作成し、PR を開く。
- CI は `docs/validate` ジョブを実行します。レビュアーが統合内容を確認して承認します。
