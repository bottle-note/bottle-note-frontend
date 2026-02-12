ARG ENV_FILE=git.environment-variables/application.next-js/dev.sops.env
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat gettext
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
ARG ENV_FILE
WORKDIR /app

# sops 설치 (arm64/amd64 지원)
RUN apk add --no-cache curl && \
    ARCH=$(uname -m) && \
    if [ "$ARCH" = "aarch64" ]; then ARCH="arm64"; fi && \
    if [ "$ARCH" = "x86_64" ]; then ARCH="amd64"; fi && \
    curl -LO https://github.com/getsops/sops/releases/download/v3.9.4/sops-v3.9.4.linux.${ARCH} && \
    mv sops-v3.9.4.linux.${ARCH} /usr/local/bin/sops && \
    chmod +x /usr/local/bin/sops

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# BuildKit secret으로 age 키를 환경변수로 주입하여 복호화
RUN --mount=type=secret,id=age_key,env=SOPS_AGE_KEY \
    if [ -z "$SOPS_AGE_KEY" ]; then echo "Error: SOPS_AGE_KEY is required" && exit 1; fi && \
    sops -d ${ENV_FILE} > .env && \
    if [ ! -s .env ]; then echo "Error: .env decryption failed" && exit 1; fi

RUN pnpm next build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/.env ./.env
USER nextjs
EXPOSE 3000
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000
CMD ["node", "server.js"]
