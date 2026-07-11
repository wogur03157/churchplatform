# 테넌트 DB 라우팅 — 변경 내역 상세

> 브랜치: `feat/tenant-db-routing` (base: `an_main` 913b0e5)
> 커밋: 82c543c · 34개 파일, +747 / -55
> 아키텍처 설명은 [tenant-db-routing.md](./tenant-db-routing.md) 참고. 이 문서는 **무엇이 왜 바뀌었는지** 기록.

---

## 1. 배경 / 목표

- 기존(an_main): 사실상 영신교회 단일 인스턴스. `DATABASE_URL` 하나, 서비스 쿼리에 교회 구분 없음, `churchId: 1` 하드코딩 2곳(auth, site-config)
- 목표: **서버 한 벌**로 여러 교회를 받되, 교회 데이터는 **물리적으로 분리된 DB**(`church_<slug>`)에 저장
  - 재정·재적처럼 민감한 데이터를 올리기 전 필수 토대
  - "교회 데이터 완전 분리 보관"을 서비스 차별점으로 사용 가능
- 제약: 기존 단일 DB 배포(영신교회)가 **수정 없이 계속 동작**해야 함 → 미식별 요청은 중앙 DB 폴백

## 2. 새로 추가된 것 (`server/modules/tenancy/`)

| 파일 | 역할 |
|---|---|
| `tenant-entities.ts` | 테넌트 DB 소속 엔티티 16개 목록. **여기 추가하면 그 테이블은 교회별 DB에 생성됨** |
| `tenant-resolver.middleware.ts` | 모든 요청에서 교회 식별 → `req.church` 주입. 식별 실패는 에러 아님(null) |
| `tenancy.service.ts` | 교회별 DataSource 생성·캐시(LRU). slug/도메인→교회 조회 캐시(60초) |
| `tenancy.constants.ts` | `TENANT_DATASOURCE` 주입 토큰(Symbol) |
| `tenancy.module.ts` | `@Global()` 모듈. 요청 스코프 `TENANT_DATASOURCE` 프로바이더 + 미들웨어 전역 적용 |
| `tenant-orm.module.ts` | `TenantOrmModule.forFeature([...])` — TypeOrmModule.forFeature 대체재 |
| `tenant-provisioning.service.ts` | DB 생성 + 스키마 동기화 + 기본 시드 (승인 시 자동 실행) |
| `tenant-db.util.ts` | dbName/접속 URL 생성 순수 유틸 (Nest 의존성 없음 → 스크립트 공용) |
| `scripts/tenants.ts` | CLI: `pnpm tenant:provision <slug|--all>`, `pnpm tenant:migrate` |

### 교회 식별 우선순위

1. `x-church-slug` 헤더 (개발/테스트용. 클라이언트는 `VITE_CHURCH_SLUG` env로 자동 첨부)
2. `Host` == `churches.customDomain`
3. `<slug>.${TENANT_BASE_DOMAIN}` 서브도메인
4. `DEFAULT_CHURCH_SLUG` env (단일 교회 배포 호환)

### 동작 원리 (요청 하나의 흐름)

```
GET /api/announcements (Host: brave.example.kr)
 → TenantResolverMiddleware: churches에서 slug 'brave' 조회(캐시) → req.church
 → AnnouncementsController → AnnouncementsService
 → @InjectRepository(Announcement) ← TenantOrmModule이 등록한 요청 스코프 팩토리
 → TENANT_DATASOURCE(요청 스코프): req.church.dbName='church_brave' → 해당 DataSource
 → church_brave DB에서 쿼리 실행
```

핵심: **서비스 코드는 한 줄도 안 바뀜.** `getRepositoryToken(Entity)`을 그대로 쓰는 요청 스코프
팩토리로 교체했기 때문에 `@InjectRepository(...)`가 자동으로 교회 DB를 바라봄.

## 3. 수정된 파일과 이유

### 서버 — 모듈 배선 교체 (12개, 기계적 변경)

`TypeOrmModule.forFeature([...])` → `TenantOrmModule.forFeature([...])`:

announcements, floating-messages, popups, layout-settings, page-groups, form-fields,
form-submissions, hero-slides, site-config, content-pages, media, public-home

> auth / churches / invitations 모듈은 **플랫폼(중앙 DB) 소속이므로 그대로** TypeOrmModule 사용.

### 서버 — 로직 변경

| 파일 | 변경 | 이유 |
|---|---|---|
| `app.module.ts` | `TenancyModule` 등록 (dbModules 목록 맨 앞) | 전역 모듈 + 미들웨어 활성화 |
| `churches/entities/church.entity.ts` | `dbName` 컬럼 추가 (varchar 64, null) | 교회 → 테넌트 DB 매핑. null이면 프로비저닝 전(중앙 DB 폴백) |
| `churches/churches.service.ts` | 승인(`review`) 시 `provisioning.provision()` 호출, `update()` 시 식별 캐시 무효화 | 승인 즉시 교회 DB 자동 생성. slug/도메인 변경 반영 |
| `auth/auth.service.ts` | `isChurchAdminOf()` 추가. `devChurchLogin`의 `churchId: 1` 하드코딩 제거 → DEFAULT_CHURCH_SLUG 또는 첫 active 교회로 연결 | 소속 검증 제공, 다교회 대응 |
| `auth/guards/admin.guard.ts` | `req.church` 있으면 church_admin의 **해당 교회 소속 검증** 추가 (super_admin 제외) | A교회 관리자가 B교회 데이터에 쓰기 못 하도록. 검증됨: 403 |
| `site-config/site-config.service.ts` | `churchId: 1` 필터 제거 → key 단위 조회 (`churchId DESC` 정렬로 레거시 행 우선) | 테넌트 DB 안에서는 churchId 무의미 |
| `auth/auth.module.ts` | forFeature에 `Church` 추가 | devChurchLogin의 교회 조회용 |

### 클라이언트

| 파일 | 변경 |
|---|---|
| `lib/api.ts` | `VITE_CHURCH_SLUG` env가 있으면 모든 요청에 `x-church-slug` 헤더 자동 첨부 (로컬에서 특정 교회로 개발할 때) |
| `App.tsx` | `/church/:slug*` 라우트 3개의 wouter 타입 에러 수정 (기존 브랜치부터 깨져 있던 것. `component=` → children 렌더 방식으로 통일) |

### 기타

| 파일 | 변경 |
|---|---|
| `shared/entities.ts` | `Church`에 `dbName: string \| null` 추가 |
| `z_docs/db-schema.sql` | churches CREATE TABLE에 `dbName` 컬럼 추가 |
| `package.json` | `tenant:provision`, `tenant:migrate` 스크립트 추가 |

## 4. 새 환경변수 (모두 선택)

| 변수 | 설명 | 기본값 |
|---|---|---|
| `TENANT_BASE_DOMAIN` | 서브도메인 매칭 베이스 (예: `mychurch.kr`) | 없음 |
| `DEFAULT_CHURCH_SLUG` | 식별 실패 시 기본 교회 | 없음 |
| `TENANT_DB_POOL_SIZE` | 테넌트 DataSource당 커넥션 수 | 3 |
| `TENANT_DS_CACHE_MAX` | 동시 유지 테넌트 DataSource 수 (초과 시 LRU 정리) | 20 |
| `VITE_CHURCH_SLUG` | (클라이언트) 개발 시 대상 교회 slug | 없음 |

## 5. 검증 결과 (2026-07-12, 로컬 MySQL 9)

- [x] `pnpm check` 타입체크 통과
- [x] `pnpm dev:no-db` Mock 모드 부팅 정상 (테넌시 모듈은 DB 모드에서만 로드)
- [x] `pnpm tenant:provision --all` → `church_brave`, `church_grave` DB + 16개 테이블 생성, `churches.dbName` 저장
- [x] brave로 공지 작성 → **church_brave에만 저장** (중앙/grace DB 0건)
- [x] grace로 조회 → 빈 배열 (교차 노출 없음)
- [x] 헤더 없이 조회 → 중앙 DB 폴백 (레거시 호환)
- [x] brave 소속 church_admin이 grace에 쓰기 → **403 Forbidden**
- [x] super_admin은 모든 교회 접근 가능

## 6. 주의사항 / 남은 일

1. **⚠️ esbuild(tsx) DI 함정**: 이 프로젝트는 데코레이터 메타데이터가 없어 **타입 기반 생성자 주입이 조용히 실패**한다.
   생성자 주입 시 반드시 `@Inject(토큰)` 명시할 것. (이번 작업 중 이걸로 라우팅 전체가 폴백되는 버그 발생 → 수정)
2. **스키마 변경 배포 절차**: 엔티티 수정 → 배포 → `pnpm tenant:migrate` (전 교회 DB 순회 동기화).
   synchronize 기반이므로 컬럼 타입 변경/삭제는 데이터 손실 가능 — **백업 후 실행**. 장기적으로 TypeORM migration 파일 체계로 전환 권장
3. **기존 배포 마이그레이션**: `ALTER TABLE churches ADD COLUMN dbName VARCHAR(64) NULL;` 만 실행하면 기존과 동일 동작.
   교회 분리는 `tenant:provision` 후 데이터 이관(`INSERT INTO church_x.t SELECT ... WHERE churchId=?`)
4. **MySQL 권한**: 앱 계정에 `CREATE` 권한 필요 (프로비저닝)
5. **미해결(이번 범위 아님)**: JWT 1년 만료·무효화 수단 없음 / 테스트 코드 부재 / 마이그레이션 파일 체계 없음
6. 중앙 DB의 기존 콘텐츠 테이블들은 폴백용으로 남아 있음. 전 교회 분리 완료 후 정리 가능
