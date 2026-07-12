# 모노레포 구조 (apps + packages + Docker)

> 브랜치: `feat/monorepo-workspace` (base: `feat/tenant-db-routing`)
> 배경: 재정·재적을 홈페이지와 분리 배포/스케일하기 위해 pnpm 워크스페이스로 전환.
> "레포 분리 대신 모노레포 + 앱 분리"를 택한 이유는 대화 기록 및 아래 '설계 원칙' 참고.

## 구조

```
churchplatform/
├── apps/
│   ├── web/        # 홈페이지 + 어드민 UI + 콘텐츠 API (기존 코드 전부)  :4000
│   ├── members/    # 재적 API (뼈대 — plan-members.md 대로 구현 예정)   :4100
│   └── finance/    # 재정 API (뼈대 — plan-finance.md 대로 구현 예정)   :4200
├── packages/       # 공유 코드 (앱들이 @platform/* 별칭으로 import)
│   ├── shared/     # 순수 상수 (COOKIE_NAME 등) — 클라이언트도 사용
│   ├── entities/   # 중앙 DB 엔티티 (User, Church, ChurchAdmin, ChurchFeature)
│   ├── auth/       # AuthService + 가드 (PlatformAuthModule, 컨트롤러 없음)
│   └── tenancy/    # 테넌트 DB 라우팅 (TenancyModule.forRoot)
├── docker/         # app.Dockerfile(공용), nginx.conf
├── docker-compose.yml
├── scripts/tenants.ts   # 전 앱 테넌트 엔티티를 union해서 프로비저닝/마이그레이션
└── z_docs/
```

## 설계 원칙

1. **앱 경계**: finance가 members 코드를 직접 import하지 않는다. 앱 간 공유는
   `packages/*`를 통해서만. (나중에 레포 분리가 필요해지면 이 경계 그대로 승격)
2. **데이터 통합 지점은 테넌트 DB**: `offerings.memberId → members.id`처럼
   같은 교회 DB 안에서 조인한다. 앱 간 HTTP 호출 없음.
3. **인증 공유**: 세 앱이 같은 `JWT_SECRET`으로 같은 httpOnly 쿠키를 검증
   (`PlatformAuthModule`). 세션 서버 불필요.
4. **테넌시 공유**: 각 앱이 `TenancyModule.forRoot({ tenantEntities })`로 자기
   엔티티 목록만 넘긴다. 교회 식별·DataSource 캐시 로직은 패키지에 한 벌.

## 임포트 규칙

- 앱/패키지 → 패키지: `import { AuthService } from "@platform/auth"`
- `@platform/*`은 **tsconfig paths**로 해석된다 (`packages/*/src`).
  각 앱 tsconfig + 루트 tsconfig + vite.config(웹 클라이언트)에 등록되어 있음.
- 웹의 기존 `@shared/*`는 유지 (apps/web 내부 전용). `@shared/const`는
  `@platform/shared` 재노출.

## 요청 라우팅 (nginx)

```
/api/members/*  → members :4100   (앱의 global prefix도 api/members)
/api/finance/*  → finance :4200
/*              → web     :4000   (정적 파일 + 나머지 API)
```

프록시가 `Host` 헤더를 전달하므로 도메인 기반 테넌트 식별이 그대로 동작한다.

## 실행

```bash
# 로컬 개발 (루트에서)
pnpm dev             # web
pnpm dev:members     # members
pnpm dev:finance     # finance
pnpm check           # 전 앱 타입체크 (pnpm -r check)

# 테넌트 DB (전 앱 엔티티 일괄)
pnpm tenant:provision <slug|--all>
pnpm tenant:migrate

# Docker (전체 스택: mysql + 앱 3개 + nginx)
cp .env.docker.example .env.docker   # 값 채우기
docker compose up -d
docker compose up -d --build finance # 재정만 재배포
```

## 새 도메인 기능을 추가할 때 (재적 예시)

1. `apps/members/server/modules/…`에 엔티티+모듈 작성
2. 엔티티를 `apps/members/server/tenant-entities.ts`에 등록
3. `scripts/tenants.ts`의 APPS 배열에 members 항목 추가
4. 모듈에서 `TenantOrmModule.forFeature([MyEntity])` (from `@platform/tenancy`)
5. 가드는 `@platform/auth`의 `AdminGuard` 등 사용
6. `pnpm tenant:migrate`로 전 교회 DB에 테이블 반영

## 주의사항

- **⚠️ tsx의 tsconfig include**: tsx는 cwd의 tsconfig에서 include에 매칭되는
  파일에만 컴파일 옵션(experimentalDecorators 등)을 적용한다. 루트에서 스크립트를
  실행하려면 루트 tsconfig include가 해당 파일들을 포함해야 함 (이미 설정됨)
- **⚠️ ESM 임포트 호이스팅**: 환경변수 로드는 `server/env.ts` side-effect 모듈이
  main.ts의 **첫 import**여야 한다. 함수 호출로 하면 app.module이 먼저 평가됨
- **⚠️ esbuild DI**: 생성자 주입은 항상 `@Inject(...)` 명시 (데코레이터 메타데이터 없음)
- **⚠️ 중앙 DB 스키마는 수동 관리**: 엔티티를 바꾸면 테넌트 DB는 `pnpm tenant:migrate`로
  자동 반영되지만, 중앙(폴백) DB는 아니다. `pnpm platform:schema-diff`로 차이를 확인하고
  안전한 구문(CREATE/ADD)만 골라 적용할 것 — 안 하면 공개 홈 등에서 Unknown column 500 발생
- 패키지에 새 외부 의존성을 추가하면 그 패키지의 package.json에 선언할 것
  (버전은 apps와 동일하게 — pnpm이 한 인스턴스로 dedupe)
- Docker 구성은 로컬에 Docker가 없어 **이미지 빌드 미검증** 상태. 각 앱의
  `pnpm build`(이미지 내부에서 실행되는 명령)는 로컬 검증 완료

## 상태 (2026-07-12)

- [x] 워크스페이스 전환, 웹 앱 이동 후 테넌트 e2e 재검증
- [x] packages 추출 (shared/entities/auth/tenancy) 후 웹 재검증
- [x] members/finance 뼈대: 부팅 + `/api/<app>/tenant`로 교회 식별 확인
- [x] scripts/tenants.ts 전 앱 union 방식으로 갱신, migrate 동작 확인
- [ ] Docker 이미지 빌드 검증 (Docker 설치된 환경에서 `docker compose build`)
