# 테넌트 DB 라우팅 (교회별 DB 분리)

서버 한 벌로 여러 교회를 서비스하되, **교회마다 물리적으로 분리된 DB**를 사용하는 구조.

## 아키텍처

```
                      ┌──────────────────────────────┐
 요청 ──▶ TenantResolver ──▶ req.church ──▶ TENANT_DATASOURCE
 (도메인/헤더)  미들웨어                        (요청 스코프)
                      │                          │
              중앙(플랫폼) DB              교회별 테넌트 DB
              ─────────────              ─────────────────
              users                      announcements, images,
              churches (+dbName)         videos, media, popups,
              church_admins              layout_settings, site_config,
              church_features            content_*, form_*, hero_slides,
              invitations                page_groups, video_categories …
```

- **중앙 DB** (`DATABASE_URL`): 계정·교회 목록·관리자 매핑 등 플랫폼 공통 데이터
- **테넌트 DB** (`church_<slug>`): 교회 콘텐츠 전부. 같은 MySQL 서버에서 database만 분리
- 향후 재정·재적 모듈도 테넌트 DB에 추가 → 교회 간 데이터가 물리적으로 섞이지 않음

## 교회 식별 우선순위 (`TenantResolverMiddleware`)

1. `x-church-slug` 헤더 — 개발/테스트용 (클라이언트는 `VITE_CHURCH_SLUG`로 자동 첨부)
2. `Host` == `churches.customDomain` — 교회 자체 도메인
3. `<slug>.${TENANT_BASE_DOMAIN}` 서브도메인
4. `DEFAULT_CHURCH_SLUG` 환경변수 — 단일 교회 배포 호환

식별 실패는 에러가 아니며(`req.church = null`), 이 경우 테넌트 리포지토리는 **중앙 DB로 폴백**한다
(기존 단일 DB 배포가 그대로 동작). `/apply`, `/super-admin` 등은 교회 컨텍스트가 필요 없다.

## 코드 구조 (`server/modules/tenancy/`)

| 파일 | 역할 |
|---|---|
| `tenant-entities.ts` | 테넌트 DB에 속하는 엔티티 목록 (여기 추가하면 테넌트 테이블이 됨) |
| `tenant-resolver.middleware.ts` | 요청 → `req.church` 주입 |
| `tenancy.service.ts` | 교회별 DataSource 캐시 (LRU, 상한 `TENANT_DS_CACHE_MAX`), slug/도메인 조회 캐시(60초) |
| `tenancy.module.ts` | 전역 모듈. 요청 스코프 `TENANT_DATASOURCE` 프로바이더 |
| `tenant-orm.module.ts` | `TenantOrmModule.forFeature([...])` — TypeOrmModule.forFeature의 테넌트 버전 |
| `tenant-provisioning.service.ts` | 교회 승인 시 DB 생성 + 스키마 + 시드 |
| `tenant-db.util.ts` | dbName/URL 생성 등 순수 유틸 (스크립트 공용) |

### 새 도메인 모듈(예: 재정, 재적)을 테넌트 DB에 넣는 방법

1. 엔티티 작성 후 `tenant-entities.ts` 목록에 추가
2. 모듈에서 `TenantOrmModule.forFeature([MyEntity])` 사용 — 서비스의
   `@InjectRepository(MyEntity)`는 그대로 동작하며 요청별 교회 DB를 바라봄
3. `pnpm tenant:migrate`로 모든 교회 DB에 테이블 반영

## 권한

`AdminGuard`가 역할 검사에 더해, **요청에 교회 컨텍스트가 있으면 church_admin이
해당 교회 소속(`church_admins`)인지 검증**한다. super_admin은 전체 접근 가능.

## 프로비저닝

- 슈퍼관리자가 교회를 **승인하면 자동 실행**: `church_<slug>` DB 생성 → 테이블 동기화 →
  기본 데이터(영상 카테고리) 시드 → `churches.dbName` 저장
- 수동 실행: `pnpm tenant:provision <slug>` / `pnpm tenant:provision --all`
- 전체 스키마 동기화: `pnpm tenant:migrate` (엔티티 변경 배포 후 실행. **백업 후 실행 권장** —
  TypeORM synchronize는 컬럼 타입 변경/삭제 시 데이터 손실 가능)
- MySQL 계정에 `CREATE` 권한 필요

## 환경변수

| 변수 | 설명 | 기본값 |
|---|---|---|
| `TENANT_BASE_DOMAIN` | 서브도메인 매칭용 베이스 도메인 (예: `mychurch.kr`) | 없음 |
| `DEFAULT_CHURCH_SLUG` | 식별 실패 시 사용할 기본 교회 slug | 없음 |
| `TENANT_DB_POOL_SIZE` | 테넌트 DataSource당 커넥션 풀 크기 | 3 |
| `TENANT_DS_CACHE_MAX` | 동시에 유지할 테넌트 DataSource 수 | 20 |

## 기존(단일 DB) 배포 마이그레이션

1. 중앙 DB에 컬럼 추가:
   ```sql
   ALTER TABLE churches ADD COLUMN dbName VARCHAR(64) NULL COMMENT '교회별 테넌트 DB 이름';
   ```
2. 아무 것도 안 하면 기존과 동일하게 동작 (모든 교회가 중앙 DB 폴백)
3. 교회를 분리하려면: `pnpm tenant:provision <slug>` 실행 후, 기존 콘텐츠 데이터를
   새 DB로 이관 (`INSERT INTO church_xxx.announcements SELECT ... WHERE churchId = ?`)

## 트래픽 흐름 예시

```
brave.mychurch.kr → TENANT_BASE_DOMAIN 매칭 → slug 'brave' → churches 조회(캐시)
  → req.church = { id: 7, dbName: 'church_brave' }
  → AdminGuard: 이 유저가 7번 교회 관리자인지 확인
  → AnnouncementsService의 repo는 church_brave DB를 바라봄
```
