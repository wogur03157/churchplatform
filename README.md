# Admin Dashboard

콘텐츠 관리 시스템(CMS). 공지사항, 이미지, 영상, 플로팅 메시지를 관리하고 공개 페이지에 노출하는 풀스택 웹 애플리케이션.

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React 19, TypeScript, Tailwind CSS v4, shadcn/ui |
| 백엔드 | NestJS, TypeORM, MySQL |
| 인증 | Google OAuth 2.0, JWT (jose), httpOnly 쿠키 |
| 파일 스토리지 | AWS S3 (또는 호환 서비스) |
| AI 어시스턴트 | OpenAI 호환 API |
| 상태 관리 | TanStack Query v5 |
| 라우터 | Wouter |
| 패키지 매니저 | pnpm |

---

## 주요 기능

### 공개 페이지 (`/`)
- 레이아웃 설정에 따라 섹션을 동적으로 렌더링
- 공지사항 / 이미지 갤러리 / 영상 목록 표시
- 플로팅 메시지 팝업 (위치, 유형, 기간 설정 가능)
- 공지사항 상세 페이지 (`/announcements/:id`)

### 관리자 대시보드 (`/admin`)
Google 계정으로 로그인한 관리자만 접근 가능.

| 메뉴 | 기능 |
|------|------|
| 공지사항 | 작성 / 수정 / 삭제 / 발행(published) 전환 |
| 이미지 | 업로드 / 수정 / 삭제 / 공개 전환 / 표시 순서 |
| 영상 | YouTube·Vimeo URL 등록 또는 파일 직접 업로드 |
| 플로팅 메시지 | 메시지 유형(info/warning/success/announcement), 노출 위치, 기간 설정 |
| 레이아웃 설정 | 섹션별 표시 여부, 순서, 제목/부제목 커스터마이징 |
| AI 어시스턴트 | 텍스트 개선 / 요약 / 영한 번역 |

---

## 프로젝트 구조

```
admin-dashboard/
├── client/                   # 프론트엔드 (Vite + React)
│   └── src/
│       ├── _core/hooks/      # useAuth 등 공통 훅
│       ├── components/       # 공통 컴포넌트 (shadcn/ui 포함)
│       ├── lib/
│       │   ├── api.ts        # fetch 래퍼 (/api prefix, credentials)
│       │   └── queryClient.ts # TanStack Query 클라이언트
│       └── pages/
│           ├── PublicView.tsx         # 공개 메인 페이지
│           ├── AnnouncementDetail.tsx # 공지사항 상세
│           ├── AdminLogin.tsx         # 관리자 로그인
│           └── admin/                 # 관리자 페이지들
├── server/                   # 백엔드 (NestJS)
│   ├── main.ts               # 부트스트랩 (개발: Vite 통합, 운영: 정적 파일)
│   ├── app.module.ts         # 루트 모듈
│   ├── vite.ts               # Vite 개발 서버 미들웨어
│   └── modules/
│       ├── auth/             # JWT 인증, 가드, 데코레이터
│       ├── oauth/            # Google OAuth 콜백
│       ├── users/            # 사용자 엔티티
│       ├── announcements/    # 공지사항 CRUD
│       ├── images/           # 이미지 업로드/관리
│       ├── videos/           # 영상 등록/관리
│       ├── floating-messages/ # 플로팅 메시지 관리
│       ├── layout-settings/  # 레이아웃 설정 관리
│       ├── ai-assistant/     # LLM 텍스트 개선
│       ├── storage/          # 파일 스토리지 서비스
│       ├── notifications/    # 알림 서비스
│       └── health/           # 헬스체크
├── shared/                   # 공유 타입/상수
│   ├── const.ts
│   └── _core/errors.ts
├── .env                      # 환경변수 (직접 작성 필요)
├── env-setup.md              # 환경변수 세팅 가이드
└── migration.md              # NestJS 마이그레이션 이력
```

---

## REST API

모든 API는 `/api` prefix. 인증이 필요한 엔드포인트는 `admin` 역할 필요.

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/health` | - | 헬스체크 |
| GET | `/api/auth/me` | - | 현재 사용자 정보 |
| POST | `/api/auth/logout` | - | 로그아웃 |
| GET | `/api/oauth/google` | - | Google 로그인 리다이렉트 |
| GET | `/api/oauth/callback` | - | Google OAuth 콜백 |
| GET | `/api/announcements` | - | 공지사항 목록 (`?publishedOnly=true`) |
| GET | `/api/announcements/:id` | - | 공지사항 상세 |
| POST | `/api/announcements` | admin | 공지사항 생성 |
| PATCH | `/api/announcements/:id` | admin | 공지사항 수정 |
| DELETE | `/api/announcements/:id` | admin | 공지사항 삭제 |
| GET | `/api/images` | - | 이미지 목록 (`?publishedOnly=true`) |
| POST | `/api/images` | admin | 이미지 업로드 (base64) |
| PATCH | `/api/images/:id` | admin | 이미지 수정 |
| DELETE | `/api/images/:id` | admin | 이미지 삭제 |
| GET | `/api/videos` | - | 영상 목록 (`?publishedOnly=true`) |
| POST | `/api/videos` | admin | 영상 등록 |
| POST | `/api/videos/upload-file` | admin | 영상 파일 업로드 |
| PATCH | `/api/videos/:id` | admin | 영상 수정 |
| DELETE | `/api/videos/:id` | admin | 영상 삭제 |
| GET | `/api/floating-messages` | - | 플로팅 메시지 목록 (`?activeOnly=true`) |
| POST | `/api/floating-messages` | admin | 플로팅 메시지 생성 |
| PATCH | `/api/floating-messages/:id` | admin | 플로팅 메시지 수정 |
| DELETE | `/api/floating-messages/:id` | admin | 플로팅 메시지 삭제 |
| GET | `/api/layout-settings` | - | 레이아웃 설정 목록 |
| PATCH | `/api/layout-settings/:id` | admin | 레이아웃 설정 수정 |
| POST | `/api/ai-assistant/improve-text` | admin | AI 텍스트 개선 |

---

## 시작하기

### 사전 요구사항

- Node.js 18+
- pnpm
- MySQL 8.0+

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경변수 설정

`.env` 파일을 프로젝트 루트에 생성:

```env
# DB 연결
DATABASE_URL=mysql://root:password@localhost:3306/admin_dashboard

# JWT 서명 키 (openssl rand -base64 32 으로 생성)
JWT_SECRET=your_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
OAUTH_CALLBACK_URL=http://localhost:3000/api/oauth/callback

# 관리자 openId (로그인 후 DB에서 확인)
OWNER_OPEN_ID=google_numeric_user_id

# AI 어시스턴트 (OpenAI 호환)
BUILT_IN_FORGE_API_URL=https://api.openai.com
BUILT_IN_FORGE_API_KEY=sk-...

# 파일 스토리지 (AWS S3)
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=your-bucket-name
```

> 자세한 설정 방법은 [env-setup.md](./env-setup.md) 참고.

### 3. DB 생성 및 테이블 초기화

```sql
CREATE DATABASE admin_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

`server/app.module.ts`에서 `synchronize: true`로 변경하면 서버 시작 시 테이블이 자동 생성됨.
**운영 환경에서는 반드시 `synchronize: false`로 되돌릴 것.**

### 4. 개발 서버 실행

```bash
pnpm dev
```

- 서버: `http://localhost:3000`
- Vite HMR이 NestJS 서버와 통합되어 단일 포트에서 동작

### 5. 관리자 계정 설정

1. `http://localhost:3000/admin/login` 접속
2. Google 계정으로 로그인
3. DB에서 본인 `open_id` 확인:
   ```sql
   SELECT open_id FROM users WHERE email = 'your@gmail.com';
   ```
4. `.env`의 `OWNER_OPEN_ID`에 입력 후 서버 재시작
5. 재로그인하면 `role = 'admin'`으로 자동 업데이트됨

---

## 빌드 및 운영 배포

```bash
# 프론트엔드 + 서버 빌드
pnpm build

# 운영 서버 실행
pnpm start
```

빌드 결과물:
- `dist/public/` — Vite 빌드된 프론트엔드 정적 파일
- `dist/server/main.js` — esbuild 번들된 NestJS 서버

---

## 타입 체크

```bash
pnpm check
```

---

## 인증 플로우

```
[/admin/login]
  → "Google로 로그인" 클릭
  → GET /api/oauth/google
  → Google 계정 선택
  → GET /api/oauth/callback?code=...
  → JWT 서명 → httpOnly 쿠키(app_session_id) 발급
  → / 로 리다이렉트
```

- 세션은 httpOnly 쿠키로 관리 (XSS 방어)
- JWT 유효기간 1년
- `OWNER_OPEN_ID`와 일치하는 사용자는 자동으로 `admin` 역할 부여
