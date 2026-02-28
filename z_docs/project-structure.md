# 프로젝트 전체 구조

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React + Vite + TypeScript |
| 백엔드 | NestJS + TypeORM |
| DB | MySQL |
| 스토리지 | S3 (커스텀 Storage proxy) |
| 상태관리 | TanStack Query |
| UI 컴포넌트 | shadcn/ui + Tailwind CSS |
| 라우팅 | wouter |
| 인증 | JWT + 쿠키 (Google OAuth) |
| 패키지 매니저 | pnpm |

---

## 디렉토리 구조

```
admin-dashboard/
│
├── client/                          # 프론트엔드 (React)
│   └── src/
│       ├── App.tsx                  # 라우팅 정의
│       ├── main.tsx                 # 진입점
│       │
│       ├── pages/
│       │   ├── PublicView.tsx       # 교회 공개 홈페이지 (팝업 모달 포함)
│       │   ├── AnnouncementDetail.tsx
│       │   ├── AdminLogin.tsx       # Google OAuth 로그인
│       │   ├── Apply.tsx            # 교회 신청 폼
│       │   │
│       │   ├── admin/               # 교회 관리자 페이지
│       │   │   ├── Announcements.tsx
│       │   │   ├── Images.tsx
│       │   │   ├── Videos.tsx
│       │   │   ├── FloatingMessages.tsx
│       │   │   ├── Popups.tsx       # 팝업 관리
│       │   │   └── LayoutSettings.tsx
│       │   │
│       │   └── super-admin/         # 최고관리자 페이지
│       │       ├── SuperAdminDashboard.tsx   # 교회 목록·승인·거절
│       │       └── ChurchDetail.tsx          # 기능 플래그·관리자 관리
│       │
│       ├── components/
│       │   ├── DashboardLayout.tsx  # 사이드바 레이아웃
│       │   ├── RichTextEditor.tsx   # TipTap 에디터
│       │   ├── PreviewPanel.tsx
│       │   └── ui/                  # shadcn/ui 컴포넌트들
│       │
│       ├── _core/hooks/
│       │   └── useAuth.ts           # 인증 상태 관리
│       │
│       └── lib/
│           ├── api.ts               # fetch 래퍼 (credentials: include)
│           └── queryClient.ts       # TanStack Query 설정
│
├── server/                          # 백엔드 (NestJS)
│   ├── main.ts                      # 서버 부트스트랩
│   ├── app.module.ts                # 루트 모듈
│   ├── vite.ts                      # 개발 시 Vite 통합
│   │
│   └── modules/
│       ├── auth/                    # JWT 인증, 가드, 데코레이터
│       │   ├── guards/
│       │   │   ├── optional-auth.guard.ts   # 모든 요청에서 user 주입
│       │   │   ├── admin.guard.ts           # church_admin or super_admin
│       │   │   └── super-admin.guard.ts     # super_admin 전용
│       │   └── decorators/
│       │       └── current-user.decorator.ts
│       │
│       ├── oauth/                   # Google OAuth 콜백
│       ├── users/                   # User 엔티티
│       │
│       ├── churches/                # 교회 관리
│       │   ├── entities/
│       │   │   ├── church.entity.ts
│       │   │   ├── church-admin.entity.ts
│       │   │   └── church-feature.entity.ts
│       │   └── dto/
│       │
│       ├── announcements/           # 공지사항
│       ├── images/                  # 이미지 갤러리
│       ├── videos/                  # 영상
│       ├── floating-messages/       # 플로팅 메시지
│       ├── popups/                  # 팝업
│       ├── layout-settings/         # 레이아웃 설정
│       ├── ai-assistant/            # AI 텍스트 개선
│       ├── storage/                 # S3 파일 업로드
│       ├── notifications/           # 알림
│       │
│       ├── health/                  # GET /api/health
│       └── mock/                    # DB 없이 개발 모드
│           ├── mock-auth.controller.ts
│           └── mock-data.controller.ts   # 모든 도메인 mock 포함
│
├── shared/                          # 서버·클라이언트 공통 타입
│   ├── const.ts                     # COOKIE_NAME, ONE_YEAR_MS 등
│   └── types.ts
│
└── z_docs/                          # 기능 문서
    ├── project-structure.md         # 이 파일
    ├── super-admin.md               # 멀티 교회 플랫폼 아키텍처
    └── popup.md                     # 팝업 관리 기능
```

---

## URL 구조

| URL | 설명 |
|-----|------|
| `/` | 공개 홈페이지 (기본) |
| `/:churchSlug` | 교회별 공개 홈페이지 |
| `/:churchSlug/announcements/:id` | 공지사항 상세 |
| `/apply` | 교회 신청 |
| `/admin/login` | 관리자 로그인 |
| `/admin` | 교회 관리자 대시보드 |
| `/admin/announcements` | 공지사항 관리 |
| `/admin/images` | 이미지 관리 |
| `/admin/videos` | 영상 관리 |
| `/admin/floating-messages` | 플로팅 메시지 관리 |
| `/admin/popups` | 팝업 관리 |
| `/admin/layout` | 레이아웃 설정 |
| `/super-admin` | 최고관리자 대시보드 |
| `/super-admin/churches/:id` | 교회 상세 설정 |

---

## API 엔드포인트 목록

| Method | 경로 | 설명 |
|--------|------|------|
| GET | `/api/health` | 서버 상태 확인 |
| GET | `/api/auth/me` | 현재 로그인 사용자 |
| POST | `/api/auth/logout` | 로그아웃 |
| POST | `/api/auth/dev-login` | 개발용 로그인 (mock 모드) |
| GET | `/api/oauth/callback` | Google OAuth 콜백 |
| GET/POST/PATCH/DELETE | `/api/announcements` | 공지사항 CRUD |
| GET/POST/PATCH/DELETE | `/api/images` | 이미지 CRUD |
| GET/POST/PATCH/DELETE | `/api/videos` | 영상 CRUD |
| GET/POST/PATCH/DELETE | `/api/floating-messages` | 플로팅 메시지 CRUD |
| GET/POST/PATCH/DELETE | `/api/popups` | 팝업 CRUD |
| GET/POST/PATCH | `/api/layout-settings` | 레이아웃 설정 |
| POST | `/api/ai-assistant/improve-text` | AI 텍스트 개선 |
| GET/POST | `/api/churches` | 교회 목록/신청 |
| POST | `/api/churches/:id/review` | 교회 승인·거절 |
| GET/PATCH | `/api/churches/:id/features` | 기능 플래그 |
| GET/DELETE | `/api/churches/:id/admins` | 관리자 관리 |

---

## 역할 체계

```
super_admin  →  모든 교회 관리, 승인/거절, 기능 플래그 ON/OFF
church_admin →  담당 교회 콘텐츠 관리 (공지, 이미지, 영상 등)
user         →  일반 방문자 (공개 페이지 열람)
```

---

## 인증 흐름

```
1. /admin/login → Google OAuth 시작
2. Google 인증 완료 → /api/oauth/callback
3. JWT 생성 → HttpOnly 쿠키 설정 (SameSite=Lax)
4. 이후 모든 요청에 쿠키 자동 포함 (credentials: 'include')
5. OptionalAuthGuard가 쿠키 파싱 → user 주입
```

---

## 개발 모드 (DB 없이 실행)

```bash
SKIP_DB=true pnpm dev
```

- `MockModule` 활성화 → 모든 API가 메모리 데이터로 동작
- `/api/auth/dev-login` POST → `super_admin` 계정으로 자동 로그인
- 서버 재시작 시 데이터 초기화됨 (메모리 상태)

---

## 환경 변수

| 변수 | 설명 |
|------|------|
| `DATABASE_URL` | MySQL 접속 URL |
| `JWT_SECRET` | JWT 서명 키 |
| `GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 시크릿 |
| `BUILT_IN_FORGE_API_URL` | S3 스토리지 proxy URL |
| `BUILT_IN_FORGE_API_KEY` | S3 스토리지 proxy API 키 |
| `OWNER_OPEN_ID` | super_admin으로 지정할 Google ID |
| `SKIP_DB` | `true` 설정 시 DB 없이 mock 모드 실행 |
