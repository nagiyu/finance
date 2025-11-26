# 調査 — ドキュメント再構成

決定: コンテンツのリンティングには `remark`/`remark-lint` と `remark-preset-lint-recommended` を使用し、整形には `prettier` を使用する。`remark` が利用できない箇所では CI チェックとして `markdownlint` を追加する。

理由: `remark` エコシステムは Markdown の AST に対して柔軟でプラグイン可能なリンティングルールを提供し、本リポジトリで使用している Node/TypeScript のツールチェーンと良く統合される。`prettier` は一貫したフォーマットを担保する。`markdownlint` はシンプルなルールセットの軽量なフォールバックとして広く使われている。

決定: ドキュメントのメタデータ検証は、`/specs/001-restructure-docs/contracts/doc-metadata.schema.json` に配置する JSON Schema で行う。

理由: スキーマを用いることで必須フィールド（owner、area/topic、last-updated、related-code-paths）の自動検証が可能になり、CI によるゲーティングを支援する。

決定: CI は GitHub Actions のジョブ `docs/validate` を通じて統合し、`node` ベースのチェックを実行して PR 上で失敗を報告する。

理由: リポジトリは GitHub を利用しているため、Actions による統合が簡便である。ジョブは push と PR の両方で実行され、ドキュメントが変更されない限り関連のないコード変更をブロックしないようにする。

検討した代替案:
- 純粋に `markdownlint` のみを使う — ルール構成の柔軟性が劣るため却下。
- Python でカスタムスクリプトを作成する — クロスランゲージによる複雑さを避けるため却下。

明確化された点:
- CI 統合の詳細: GitHub Actions を使用、ランナーは `ubuntu-latest`、ジョブ名は `docs/validate`。手順は Node をインストールし、devDependencies をインストールした上で `remark` と JSON Schema 検証を実行する。
- テスト: ドキュメントチェックはリンティング／検証のみを行い、コード用の既存 `jest` テストを補完する。
