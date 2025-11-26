# クイックスタート — ドキュメント検証と移行パイロット

1. 開発依存関係のインストール（リポジトリルートから）:

```
cd /home/yusuke/repos/finance
npm install --prefix client/finance --no-audit --no-fund || true
# 推奨: `remark-cli`, `remark-preset-lint-recommended`, `prettier` をリポジトリレベルの devDeps としてインストール
```

2. ローカルでのリンティング／検証の実行（例）:

```
npx remark "docs/**/*.md" --use remark-preset-lint-recommended
npx ajv validate -s specs/001-restructure-docs/contracts/doc-metadata.schema.json -d docs/**/metadata.json
```

3. 移行パイロット手順:
- リポジトリをスキャンして `specs/001-restructure-docs/migration-plan.md` を作成する（手動またはスクリプト）。
- 1 件の移行を適用する（ファイル移動 + frontmatter の更新 + 所有者の追加）ブランチを作成し、PR を開く。
- CI は `docs/validate` ジョブを実行します。レビュアーが統合内容を確認して承認します。
