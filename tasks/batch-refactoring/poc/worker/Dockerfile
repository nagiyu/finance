FROM node:18-alpine AS base

# 作業ディレクトリの設定
WORKDIR /app

# ビルドステージ
FROM base AS builder

# 依存関係のコピーとインストール
COPY package*.json ./
RUN npm ci --only=production

# ソースコードのコピー
COPY . .

# TypeScript のビルド（esbuild 使用）
RUN npm run build

# ランタイムステージ
FROM base AS runner

# Node.js の本番環境設定
ENV NODE_ENV=production

# 必要なファイルのみコピー
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 非 root ユーザーで実行
USER node

# エントリーポイント
CMD ["node", "dist/index.js"]
