# NestJS 마이그레이션 현황

## 개요

| 항목 | 이전 | 이후 |
|------|------|------|
| 백엔드 프레임워크 | Express + tRPC v11 | NestJS + REST API |
| ORM | Drizzle ORM | TypeORM |
| DB 드라이버 | mysql2 | mysql2 (유지) |
| 프론트엔드 API | tRPC 클라이언트 | fetch + TanStack Query |
| 인증 | JWT + 쿠키 (jose) | JWT + 쿠키 (jose, 동일 방식 유지) |

---

## 완료된 작업 ✅

### 설정 파일
- `package.json` — NestJS 의존성 추가, tRPC/Drizzle 제거, 빌드 스크립트 변경
- `tsconfig.json` — `experimentalDecorators`, `emitDecoratorMetadata` 추가
- `tsconfig.server.json` — 서버 전용 TypeScript 설정 생성

### 백엔드 (server/)

**NestJS 코어**
- `server/main.ts` — NestJS 부트스트랩, cookie-parser, `/api` prefix, Vite 개발서버 통합
- `server/app.module.ts` — 루트 모듈 (TypeOrmModule.forRoot + 전체 모듈 등록)
- `server/vite.ts` — Vite 개발서버 미들웨어 (`/api/` 경로 제외)

**인증 (modules/auth/)**
- `auth.service.ts` — JWT 서명/검증, OAuth 토큰 교환, 사용자 upsert, 세션 관리
- `auth.controller.ts` — `GET /api/auth/me`, `POST /api/auth/logout`
- `guards/optional-auth.guard.ts` — 모든 요청에서 user 주입 (없으면 null)
- `guards/admin.guard.ts` — admin role 검사
- `decorators/current-user.decorator.ts` — `@CurrentUser()` 파라미터 데코레이터

**OAuth (modules/oauth/)**
- `oauth.controller.ts` — `GET /api/oauth/callback` (코드 교환 → 세션 쿠키 설정 → `/` 리다이렉트)

**도메인 모듈** (각각 entity / service / controller / module 포함)
- `modules/announcements/` — `GET/POST/PATCH/DELETE /api/announcements`
- `modules/images/` — `GET/POST/PATCH/DELETE /api/images` (base64 업로드 → StorageService)
- `modules/videos/` — `GET/POST/PATCH/DELETE /api/videos`, `POST /api/videos/upload-file`
- `modules/floating-messages/` — `GET/POST/PATCH/DELETE /api/floating-messages`
- `modules/layout-settings/` — `GET /api/layout-settings`, `PATCH /api/layout-settings/:id`
- `modules/users/` — User 엔티티

**공통 서비스**
- `modules/storage/storage.service.ts` — Forge 스토리지 프록시 업로드 (`BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`)
- `modules/notifications/notifications.service.ts` — Forge 알림 서비스
- `modules/ai-assistant/ai-assistant.service.ts` — LLM 호출 (gemini-2.5-flash via Forge API)
- `modules/ai-assistant/ai-assistant.controller.ts` — `POST /api/ai-assistant/improve-text`
- `modules/health/health.controller.ts` — `GET /api/health`

**TypeORM 엔티티** (drizzle/schema.ts에서 이전)
- `User`, `Announcement`, `Image`, `Video`, `FloatingMessage`, `LayoutSetting`
- 컬럼명은 기존 DB와 동일하게 유지 (데이터 호환)

### 프론트엔드 (client/src/)

**공통 인프라**
- `lib/api.ts` — fetch 래퍼 (`/api` prefix, `credentials: 'include'`, 에러 처리)
- `lib/queryClient.ts` — TanStack Query 클라이언트 (401 에러 시 로그인 페이지 리다이렉트)
- `main.tsx` — tRPC Provider 제거, QueryClientProvider만 유지

**tRPC → useQuery/useMutation 전환 완료 파일**
- `_core/hooks/useAuth.ts`
- `pages/PublicView.tsx`
- `pages/Home.tsx`
- `pages/AnnouncementDetail.tsx`
- `pages/admin/Announcements.tsx`
- `pages/admin/Images.tsx`
- `pages/admin/Videos.tsx`
- `pages/admin/FloatingMessages.tsx`
- `pages/admin/FloatingMessagesForm.tsx`
- `pages/admin/LayoutSettings.tsx`
- `components/PreviewPanel.tsx`

### 삭제된 파일
- `server/_core/` (전체 디렉토리)
- `server/routers.ts`, `server/db.ts`, `server/storage.ts`
- `server/announcements.test.ts`, `server/auth.logout.test.ts`
- `drizzle/` (전체 디렉토리), `drizzle.config.ts`
- `vitest.config.ts`
- `client/src/lib/trpc.ts`

### 검증
- `pnpm check` (TypeScript) — 에러 0개 ✅
- `pnpm dev` — NestJS 부트스트랩 정상 ✅
- pnpm PATH 문제 — `corepack enable pnpm`으로 해결 ✅

---

## 남은 작업 ⏳

### 1. 환경변수 설정 (필수)

`.env` 파일을 프로젝트 루트에 생성해야 함:

```env
# DB 연결
DATABASE_URL=mysql://user:password@host:3306/dbname

# JWT 서명 키
JWT_SECRET=your_jwt_secret

# OAuth
OAUTH_SERVER_URL=https://...
VITE_APP_ID=your_app_id
OWNER_OPEN_ID=your_open_id  # 이 openId를 가진 사용자가 admin 역할 부여

# Forge 스토리지/AI (이미지·영상 업로드, AI 어시스턴트)
BUILT_IN_FORGE_API_URL=https://...
BUILT_IN_FORGE_API_KEY=your_forge_api_key
```

### 2. 동작 검증 (환경변수 설정 후)

- [ ] `GET /api/health` 응답 확인
- [ ] 공개 페이지(`/`) 데이터 로딩 확인
- [ ] OAuth 로그인 → 세션 쿠키 발급 → 관리자 페이지 접근 확인
- [ ] 공지사항 CRUD 동작 확인
- [ ] 이미지 업로드 → Forge 스토리지 저장 → URL 반환 확인
- [ ] 영상 등록 (YouTube/Vimeo URL 및 파일 업로드) 확인
- [ ] AI 어시스턴트 텍스트 개선 기능 확인

### 3. 알려진 미구현 사항

- `FloatingMessagesForm`의 폼 필드 저장 기능: 원래 tRPC에도 엔드포인트가 없었음. 현재 저장 버튼 클릭 시 "준비 중" toast만 표시. 필요하면 별도 엔드포인트 추가 필요.

---

## REST API 엔드포인트 전체 목록

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/health` | 없음 | 헬스체크 |
| GET | `/api/auth/me` | 선택 | 현재 사용자 정보 |
| POST | `/api/auth/logout` | 선택 | 로그아웃 |
| GET | `/api/oauth/callback` | 없음 | OAuth 콜백 |
| GET | `/api/announcements` | 선택 | 공지사항 목록 (`?publishedOnly=true`) |
| GET | `/api/announcements/:id` | 선택 | 공지사항 상세 |
| POST | `/api/announcements` | admin | 공지사항 생성 |
| PATCH | `/api/announcements/:id` | admin | 공지사항 수정 |
| DELETE | `/api/announcements/:id` | admin | 공지사항 삭제 |
| GET | `/api/images` | 선택 | 이미지 목록 (`?publishedOnly=true`) |
| GET | `/api/images/:id` | 선택 | 이미지 상세 |
| POST | `/api/images` | admin | 이미지 업로드 (base64) |
| PATCH | `/api/images/:id` | admin | 이미지 수정 |
| DELETE | `/api/images/:id` | admin | 이미지 삭제 |
| GET | `/api/videos` | 선택 | 영상 목록 (`?publishedOnly=true`) |
| GET | `/api/videos/:id` | 선택 | 영상 상세 |
| POST | `/api/videos` | admin | 영상 등록 |
| POST | `/api/videos/upload-file` | admin | 영상 파일 업로드 |
| PATCH | `/api/videos/:id` | admin | 영상 수정 |
| DELETE | `/api/videos/:id` | admin | 영상 삭제 |
| GET | `/api/floating-messages` | 선택 | 플로팅 메시지 목록 (`?activeOnly=true`) |
| GET | `/api/floating-messages/:id` | 선택 | 플로팅 메시지 상세 |
| POST | `/api/floating-messages` | admin | 플로팅 메시지 생성 |
| PATCH | `/api/floating-messages/:id` | admin | 플로팅 메시지 수정 |
| DELETE | `/api/floating-messages/:id` | admin | 플로팅 메시지 삭제 |
| GET | `/api/layout-settings` | 선택 | 레이아웃 설정 목록 |
| PATCH | `/api/layout-settings/:id` | admin | 레이아웃 설정 수정 |
| POST | `/api/ai-assistant/improve-text` | admin | AI 텍스트 개선 |
