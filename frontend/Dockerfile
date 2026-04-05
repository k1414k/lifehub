# 本番注釈
# FROM node:20-alpine AS base

# FROM base AS deps
# RUN apk add --no-cache libc6-compat
# WORKDIR /app
# COPY package.json package-lock.json* ./
# RUN npm install

# FROM base AS builder
# WORKDIR /app
# COPY --from=deps /app/node_modules ./node_modules
# COPY . .
# RUN npm run build

# FROM base AS runner
# WORKDIR /app
# ENV NODE_ENV=production
# RUN addgroup --system --gid 1001 nodejs
# RUN adduser  --system --uid 1001 nextjs
# COPY --from=builder /app/public ./public
# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# USER nextjs
# EXPOSE 3000
# ENV PORT=3000
# CMD ["node", "server.js"]
FROM node:20-alpine
WORKDIR /app

# 依存関係のインストールに必要なファイルのみコピー
COPY package.json package-lock.json* ./
RUN npm install

# 全ファイルをコピー
COPY . .

EXPOSE 3000

# デフォルトは本番起動に寄せる。ローカル開発は docker-compose の command 上書きで `npm run dev` を使う。
CMD ["sh", "-c", "npm run build && npm run start"]