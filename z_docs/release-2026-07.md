# 릴리스 노트 — 2026-07 (feat/monorepo-workspace)

> base: `an_main` → 커밋 15개, 412파일, +12,000줄
> 핵심: 단일 교회 홈페이지 → **멀티테넌트 SaaS(홈페이지+재적+재정)** 로 전환

## 무엇이 바뀌었나 (계층별)

### 1. 플랫폼 기반

| 변경 | 내용 | 커밋 |
|---|---|---|
| 테넌트 DB 라우팅 | 교회별 DB(`church_<slug>`) 분리, 도메인/헤더로 교회 식별, 승인 시 자동 프로비저닝. 상세: [tenant-db-routing.md](./tenant-db-routing.md), [changelog](./tenant-routing-changelog.md) | 82c543c |
| 모노레포 전환 | `apps/{web,members,finance}` + `packages/{shared,entities,auth,tenancy}` + Docker/nginx. 상세: [monorepo.md](./monorepo.md) | 6fd8cea |
| 권한 체계 | 기능 플래그(교회) → 역할 → 개인 권한(admin_permissions). 민감 권한은 allow-list(`RequirePermission(key, {defaultDeny})`), `PermissionsService`로 필드 단위 검사 | f900ee5, 34765c1 |
| 스키마 도구 | `pnpm tenant:migrate`(교회별 DB 자동), `pnpm platform:schema-diff`(중앙 DB 수동 검토) | 6fd8cea, 140f450 |

### 2. 재적 (apps/members) — MVP 완료

- 교인·가족·직분 CRUD — 연락처·주소 AES-256-GCM 암호화(`MEMBER_DATA_KEY`), 감사 로그 (f900ee5)
- 엑셀 임포트(컬럼 자동 인식·실패 리포트)/익스포트, 조직 트리, 출석 세션·체크·통계, 새가족 단계 (5bd73ab)
- 심방(요청→배정→완료, 기록은 민감 필드 마스킹) + 목양 메모(열람도 감사 로그) (34765c1)
- 대시보드: 재적 현황·장기결석 감지·생일·새가족 (5bd73ab)
- 화면 5종: 교인 목록·조직도·출석 체크(모바일)·새가족 칸반·심방 (5bd73ab, 5f38cb0)

### 3. 재정 (apps/finance) — MVP + 기부금영수증 완료

- 회계연도·부서·계정과목(기본 시드), **헌금 계수**(세션→봉투 연속 입력→계수표→확정), **불변 원장**(void+사유) (f7b66b2)
- **지출결의**: 기안(연번 채번, 영수증 base64 첨부→로컬 서빙) → 승인/반려(`finance_approve`) → 지급(이후 불변) (09999bd)
- **예산**: 항목별 편성·집행률, 기안 시 초과 경고 / **월 마감**: 잠긴 월 기록 차단 (f77c62a)
- **보고서**: 월간(이월→수입→지출→잔액 자동 계산, 인쇄), 주보용 주간 요약, **투명성 공개 페이지** `/transparency` (b0dd18a)
- **기부금영수증**: 교인별 연간 집계→일괄 발급(스냅샷·연번)→인쇄 양식→**국세청 제출 CSV**. 주민번호는 발급 시에만 수집·암호화(`FINANCE_DATA_KEY`)·마스킹 (321c6c2)
- 화면 7종: 계수·지출결의·예산·장부(+월 마감)·보고서·영수증·설정

### 4. 보안·정합성 수정 (전체 리뷰 후)

- 공개 홈/레이아웃의 churchId=1 하드코딩 제거 — 두 번째 교회부터 홈이 비던 버그 (테넌트 DB가 격리 담당, churchId 필터 폐기)
- `TENANT_FALLBACK=reject`: 교회 미식별 요청의 중앙 DB 폴백 차단 옵션 (다교회 운영 필수 — 버블링 방지)
- 영수증 첨부: 비인증 정적 서빙 제거 → 인증 다운로드 엔드포인트 + 교회별 폴더(uploads/<slug>/) + slug 검증
- admin_permissions에 churchId 스코프 추가 — 여러 교회 관리자의 권한이 교회를 넘어 번지지 않음 (NULL=글로벌, 기존 행 호환)
- 예산 초과 경고가 승인됨(미지급) 금액을 누락하던 버그 수정
- 기부금영수증: 이름 미해결 교인 발급 차단 (폴백 문자열이 성명 스냅샷으로 저장되던 문제)
- 지출결의·영수증 연번 채번 동시성 재시도

### 5. 버그 수정

- members/finance 앱 body 한도 100kb→20mb (엑셀·영수증 업로드) (09999bd)
- 중앙 DB 스키마 누락(gridCols, content_* 테이블)으로 인한 공개 홈 500 (140f450)

## DB 변경 요약

- **중앙 DB**: `churches.dbName` 추가, `admin_permissions` 테이블, `church_features`에 members/finance 키
- **교회별 DB 신규 테이블** (tenant:migrate로 생성):
  - 재적: members, families, positions, member_groups(+members), attendance_sessions/records, newcomer_stages/progress, visitations, pastoral_notes, member_audit_logs
  - 재정: fiscal_years, departments, accounts, offering_batches, offerings, expense_requests(+attachments), budgets, closing_locks, donation_receipts, finance_config, finance_audit_logs

## 새 환경변수

`MEMBER_DATA_KEY`, `FINANCE_DATA_KEY`(암호화 — 운영 필수), `DEFAULT_CHURCH_SLUG`,
`TENANT_BASE_DOMAIN`, `TENANT_DB_POOL_SIZE`, `TENANT_DS_CACHE_MAX`,
`MEMBERS_API_URL`/`FINANCE_API_URL`(web 프록시 대상, 기본 localhost)

## 검증 상태

- 전 기능 API e2e + 브라우저 검증 완료 (교회 간 격리·권한·암호화·불변성 포함)
- 프로덕션 빌드 3종 로컬 검증 완료 / **Docker 이미지 빌드는 미검증**(로컬에 Docker 없음)
- 테스트 코드 부재 — 금전 로직 유닛 테스트가 다음 기술 부채 1순위

## 남은 로드맵

1. GitHub 푸시 + Docker 빌드 검증 + 서버 배포
2. 국세청 CSV의 홈택스 실제 스펙 대조 (매년 11월 점검)
3. 통장 내역 매칭, 보고서 PDF, 알림톡, 교인 셀프서비스 (기획서 2단계)
4. 금전 로직 테스트 도입, TypeORM migration 파일 체계 전환
