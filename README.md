# 교회 플랫폼 (churchplatform)

교회 **홈페이지 + 재적(교인 관리) + 재정(회계)** 를 하나로 묶은 멀티테넌트 SaaS.
한 벌의 서버로 여러 교회를 서비스하며, **교회마다 데이터베이스가 물리적으로 분리**됩니다.

| 서비스 | 내용 | 포트 |
|---|---|---|
| **web** | 교회 공개 홈페이지(커스텀 레이아웃) + 어드민 UI + 콘텐츠 API | 4000 |
| **members** | 재적 — 교인·가족·직분, 조직, 출석, 새가족, 심방, 엑셀 | 4100 |
| **finance** | 재정 — 헌금 계수, 지출결의, 예산, 마감, 보고서, 기부금영수증 | 4200 |

> 📖 문서: [기획서(재적)](z_docs/plan-members.md) · [기획서(재정)](z_docs/plan-finance.md) ·
> [모노레포 구조·규칙](z_docs/monorepo.md) · [테넌트 DB 아키텍처](z_docs/tenant-db-routing.md) ·
> [관리자 사용 설명서](z_docs/user-guide.md) · [2026-07 릴리스 노트](z_docs/release-2026-07.md)

---

## 아키텍처 한눈에

```
                        ┌── nginx (경로 라우팅) ──┐
  *.도메인 ─────────────▶│ /api/members/* → :4100 │
                        │ /api/finance/* → :4200 │
                        │ /*             → :4000 │
                        └────────────────────────┘
        세 앱이 공유: 같은 JWT 쿠키(인증) + 같은 테넌시 모듈(교회 식별)

  ┌─ 중앙 DB (admin_dashboard) ─┐   ┌─ 교회별 DB (church_<slug>) ──────────────┐
  │ users, churches(+dbName),   │   │ 콘텐츠(공지·미디어·레이아웃…)            │
  │ church_admins, permissions, │   │ 재적(members, attendance, visitations…) │
  │ invitations, features       │   │ 재정(offerings, expenses, receipts…)    │
  └─────────────────────────────┘   └──────────────────────────────────────────┘
```

- **교회 식별**: 요청의 커스텀 도메인 → 서브도메인 → `x-church-slug` 헤더 → `DEFAULT_CHURCH_SLUG` 순.
  식별된 교회의 DataSource로 자동 라우팅 (`packages/tenancy`)
- **권한 3단계**: 교회 기능 플래그(church_features) → 관리자 역할 → 개인 권한(admin_permissions).
  민감 권한(`members_sensitive`, `finance_approve`)은 **명시 허용(allow-list)** 방식
- **금전 기록은 불변**: 수정·삭제 대신 취소(voided)+재입력, 월 마감 시 잠금

## 디렉토리

```
apps/web        홈페이지 + 어드민 UI (React 19 + NestJS, 클라이언트는 여기 하나뿐)
apps/members    재적 API (NestJS)
apps/finance    재정 API (NestJS)
packages/       공유 코드 — shared(상수)·entities(중앙DB)·auth(인증/권한)·tenancy(테넌트 라우팅)
scripts/        tenants.ts(프로비저닝·마이그레이션), platform-schema-log.ts(스키마 diff)
docker/         공용 Dockerfile + nginx.conf
z_docs/         기획서·아키텍처·가이드 문서
```

## 시작하기

### 요구사항

- Node.js 20.18+ · pnpm 10.4.1 (`corepack enable && corepack prepare pnpm@10.4.1 --activate`)
- MySQL 8.0+

### 1. 설치 & 환경변수

```bash
pnpm install --frozen-lockfile
```

루트에 `.env` 생성 (세 앱이 공유):

```env
DATABASE_URL=mysql://root:password@localhost:3306/admin_dashboard
JWT_SECRET=openssl-rand-base64-32로-생성          # 세 앱 공통 — 로그인 쿠키 공유의 핵심

# Google OAuth (web 로그인)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
OAUTH_CALLBACK_URL=http://localhost:4000/api/oauth/callback
OWNER_OPEN_ID=관리자로_지정할_구글_ID

# 개인정보 암호화 키 (운영 필수 — 없으면 평문 저장 + 경고)
MEMBER_DATA_KEY=...        # 교인 연락처·주소
FINANCE_DATA_KEY=...       # 기부금영수증 주민번호

# 테넌트 식별 (선택)
DEFAULT_CHURCH_SLUG=       # 단일 교회 배포 시 기본 교회
TENANT_BASE_DOMAIN=        # <slug>.도메인 서브도메인 매칭용
```

### 2. DB 준비

```bash
# 중앙 DB 스키마 (최초 1회)
mysql -uroot -e "CREATE DATABASE admin_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
mysql -uroot admin_dashboard < z_docs/db-schema.sql
```

교회 승인(`/super-admin`) 시 교회별 DB가 **자동 생성**됩니다. 수동으로는:

```bash
pnpm tenant:provision <slug>    # 특정 교회 프로비저닝 (DB 생성+스키마+시드)
pnpm tenant:provision --all     # 미프로비저닝 active 교회 전부
```

### 3. 실행

```bash
pnpm dev            # web     http://localhost:4000
pnpm dev:members    # members http://localhost:4100
pnpm dev:finance    # finance http://localhost:4200
```

- 관리자: `http://localhost:4000/admin` (개발 모드에선 `POST /api/auth/dev-login`(슈퍼) /
  `dev-church-login`(교회 관리자)로 즉시 로그인 가능)
- 특정 교회로 개발: 요청에 `x-church-slug: <slug>` 헤더 또는 `VITE_CHURCH_SLUG` env

### 4. 스키마 변경 워크플로 ⚠️

```bash
# 엔티티 수정 후 —
pnpm tenant:migrate          # 교회별 DB 전체에 자동 반영 (백업 후 실행 권장)
pnpm platform:schema-diff    # 중앙 DB와의 차이 SQL 출력 → CREATE/ADD만 골라 수동 적용
```

중앙 DB는 실데이터 보호를 위해 자동 동기화하지 않습니다. diff 출력 중
DROP·타입변경 구문은 그대로 실행하지 말 것.

### 5. 검증

```bash
pnpm check          # 전 앱 타입체크
pnpm build          # 전 앱 프로덕션 빌드 (web: vite+esbuild, members/finance: esbuild)
```

## 배포 (Docker)

```bash
cp .env.docker.example .env.docker   # 값 채우기
docker compose up -d                 # mysql + web + members + finance + nginx
docker compose up -d --build finance # 특정 앱만 재배포
```

- 이미지 하나(`docker/app.Dockerfile`)를 `--build-arg APP=web|members|finance`로 공유
- nginx가 경로로 분기, `Host` 헤더 전달로 도메인 기반 교회 식별 유지
- 볼륨: `dbdata`(MySQL), `uploads`(웹 업로드), `finance_uploads`(영수증 첨부)

## 운영 참고

- **권한 부여**: 슈퍼관리자가 `PUT /api/churches/:id/admins/:userId/permissions`
  `{ "permKey": "members_sensitive" | "finance_approve", "status": "allowed" }`
- **감사 로그**: 교인 데이터 접근(member_audit_logs)·금전 기록(finance_audit_logs) 자동 기록
- **개발 함정 모음**: [monorepo.md 주의사항](z_docs/monorepo.md#주의사항)
  (esbuild DI `@Inject` 필수, ESM env 로드 순서, tsx tsconfig include, 중앙 DB 수동 스키마)
