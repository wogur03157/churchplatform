#!/bin/bash
# 원격 서버 .env 파일 생성 스크립트
# 사용법: bash scripts/setup-env.sh

set -e

if [ -f .env ]; then
  echo "⚠️  .env 파일이 이미 존재합니다."
  read -p "덮어쓰겠습니까? (y/N): " overwrite
  [[ "$overwrite" =~ ^[Yy]$ ]] || { echo "취소됨"; exit 0; }
fi

echo ""
echo "=== 서버 환경 설정 ==="
echo ""

# ── DB 설정 ──────────────────────────────────────────────────
read -p "DB 호스트 [localhost]: " DB_HOST
DB_HOST="${DB_HOST:-localhost}"

read -p "DB 포트 [3306]: " DB_PORT
DB_PORT="${DB_PORT:-3306}"

read -p "DB 이름 [churchplatform]: " DB_NAME
DB_NAME="${DB_NAME:-churchplatform}"

read -p "DB 유저 [churchuser]: " DB_USER
DB_USER="${DB_USER:-churchuser}"

read -s -p "DB 비밀번호 [churchpassword]: " DB_PASS
DB_PASS="${DB_PASS:-churchpassword}"
echo ""

# ── 서버 도메인 ───────────────────────────────────────────────
read -p "서버 도메인 (예: https://example.com) [http://localhost:4000]: " SERVER_DOMAIN
SERVER_DOMAIN="${SERVER_DOMAIN:-http://localhost:4000}"
SERVER_DOMAIN="${SERVER_DOMAIN%/}"  # 끝 슬래시 제거

# ── JWT ───────────────────────────────────────────────────────
read -p "JWT Secret 자동 생성? (Y/n): " gen_jwt
if [[ "$gen_jwt" =~ ^[Nn]$ ]]; then
  read -p "JWT_SECRET: " JWT_SECRET
else
  JWT_SECRET=$(openssl rand -base64 32)
  echo "JWT_SECRET 생성됨: $JWT_SECRET"
fi

# ── Google OAuth ──────────────────────────────────────────────
echo ""
echo "── Google OAuth (Google Cloud Console에서 확인) ──"
read -p "GOOGLE_CLIENT_ID [기존값 사용]: " GOOGLE_CLIENT_ID
GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:-387755078329-dr88v44d8d48sd1mimpfjstoo0iout6e.apps.googleusercontent.com}"

read -s -p "GOOGLE_CLIENT_SECRET [기존값 사용]: " GOOGLE_CLIENT_SECRET
GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET:-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}"
echo ""

# ── 슈퍼어드민 ────────────────────────────────────────────────
read -p "OWNER_OPEN_ID (Google 숫자 ID) [기존값 사용]: " OWNER_OPEN_ID
OWNER_OPEN_ID="${OWNER_OPEN_ID:-100507398130019776410}"

# ── .env 파일 작성 ────────────────────────────────────────────
cat > .env <<EOF
# DB 연결
DATABASE_URL=mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}

# JWT 서명 키
JWT_SECRET=${JWT_SECRET}

# Google OAuth
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
OAUTH_CALLBACK_URL=${SERVER_DOMAIN}/api/oauth/callback

# 슈퍼어드민 Google OpenID
OWNER_OPEN_ID=${OWNER_OPEN_ID}
EOF

echo ""
echo "✅ .env 파일이 생성되었습니다."
echo ""
echo "⚠️  Google Cloud Console에서 아래 URL을 OAuth 리디렉션 URI에 추가해야 합니다:"
echo "   ${SERVER_DOMAIN}/api/oauth/callback"
echo ""

# ── DB 초기화 여부 ────────────────────────────────────────────
read -p "DB 초기화(dump.sql 임포트)도 진행할까요? (y/N): " do_db
if [[ "$do_db" =~ ^[Yy]$ ]]; then
  if [ ! -f dump.sql ]; then
    echo "❌ dump.sql 파일이 없습니다."
    exit 1
  fi
  echo "DB 임포트 중..."
  mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < dump.sql
  echo "✅ DB 임포트 완료"
fi

echo ""
echo "다음 단계:"
echo "  1. pnpm install --frozen-lockfile"
echo "  2. pnpm build"
echo "  3. NODE_ENV=production node dist/server/main.js"
