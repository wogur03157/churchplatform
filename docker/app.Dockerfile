# 공용 앱 이미지 — build-arg APP으로 web/members/finance 선택
#
#   docker build -f docker/app.Dockerfile --build-arg APP=web -t churchplatform-web .
#
# 컨텍스트는 반드시 저장소 루트.

ARG NODE_VERSION=22

# ── 1) 의존성 + 빌드 ─────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS build
ARG APP
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
WORKDIR /repo

# 매니페스트만 먼저 복사 → 의존성 레이어 캐시
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY patches ./patches
COPY packages/shared/package.json packages/shared/
COPY packages/entities/package.json packages/entities/
COPY packages/auth/package.json packages/auth/
COPY packages/tenancy/package.json packages/tenancy/
COPY apps/web/package.json apps/web/
COPY apps/members/package.json apps/members/
COPY apps/finance/package.json apps/finance/
RUN pnpm install --frozen-lockfile

# 소스 복사 후 대상 앱 빌드
COPY packages ./packages
COPY apps ./apps
COPY tsconfig.json ./
RUN pnpm --filter @churchplatform/${APP} build

# ── 2) 런타임 ────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS runtime
ARG APP
ENV NODE_ENV=production APP_NAME=${APP}
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
WORKDIR /repo

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY patches ./patches
COPY packages/shared/package.json packages/shared/
COPY packages/entities/package.json packages/entities/
COPY packages/auth/package.json packages/auth/
COPY packages/tenancy/package.json packages/tenancy/
COPY apps/web/package.json apps/web/
COPY apps/members/package.json apps/members/
COPY apps/finance/package.json apps/finance/
# 런타임 의존성만 설치 (esbuild 번들이 node_modules를 external로 참조)
RUN pnpm install --frozen-lockfile --prod

COPY --from=build /repo/apps/${APP}/dist ./apps/${APP}/dist
# web은 로컬 업로드 폴더 사용 (S3 미설정 시 폴백) — 볼륨 마운트 지점
RUN mkdir -p apps/${APP}/uploads

WORKDIR /repo/apps/${APP}
CMD ["sh", "-c", "node dist/server/main.cjs"]
