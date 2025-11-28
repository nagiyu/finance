# finance Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-27

## Active Technologies
- 特定の DB 変更は行わない（ストレージは現状準拠、インフラは AWS CloudFormation テンプレートで管理） (003-restructure-monorepo)
- Node.js 20.x / TypeScript 5.x (`strict` を有効) + Next.js (client)、TypeScript、`typescript-common`、`nextjs-common`、Jest、ESLint/Prettier、GitHub Actions (003-restructure-monorepo)

- Repository contains TypeScript (Node 18+/TS 5.x) and Markdown docs. Code language decisions for this feature: N/A for runtime, but tooling is Node/TypeScript based. + Existing repo uses `typescript-common` and `nextjs-common` submodules; docs tooling proposals: `remark`/`remark-lint`, `markdownlint`, and `prettier` for formatting. (001-restructure-docs)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

Repository contains TypeScript (Node 18+/TS 5.x) and Markdown docs. Code language decisions for this feature: N/A for runtime, but tooling is Node/TypeScript based.: Follow standard conventions

## Recent Changes
- 003-restructure-monorepo: Added Node.js 20.x / TypeScript 5.x (`strict` を有効) + Next.js (client)、TypeScript、`typescript-common`、`nextjs-common`、Jest、ESLint/Prettier、GitHub Actions

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
