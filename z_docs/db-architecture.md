# DB 아키텍처 — 어떤 DB가 무슨 역할을 하나

> 개발자용. 스키마 상세는 [db-schema.sql](./db-schema.sql)(중앙 DB)과 각 앱의 엔티티 파일,
> 라우팅 동작은 [tenant-db-routing.md](./tenant-db-routing.md) 참고.

## 큰 그림: DB가 두 종류다

```
MySQL 서버 1대
├── admin_dashboard          ← 중앙(플랫폼) DB — 1개
│     "누가 어떤 교회의 관리자이고, 그 교회는 무엇을 구독했나"
│
├── church_brave             ← 교회별(테넌트) DB — 교회 수만큼
├── church_grace                "그 교회의 실제 데이터 전부"
└── church_...                  (콘텐츠 + 재적 + 재정)
```

- **중앙 DB**: 계정·교회·구독·권한 등 *플랫폼 운영 데이터*. 모든 요청이 여기서
  "이 요청이 어느 교회 것인지, 이 사람이 뭘 할 수 있는지"를 판정한다.
- **교회별 DB**: 교인 개인정보·헌금·지출 등 *교회 소유 데이터*. 물리적으로 분리되어
  교차 유출이 구조적으로 불가능하고, 교회 단위 백업/파기가 깔끔하다.
- 요청 흐름: 미들웨어가 도메인/헤더로 교회 식별 → `churches.dbName`으로 해당 DB의
  DataSource를 꺼내 씀 (`packages/tenancy`, 요청 스코프 주입).

## 중앙 DB (admin_dashboard)

### 플랫폼 핵심 테이블

| 테이블 | 역할 |
|---|---|
| `users` | 전 교회 공통 로그인 계정 (Google OAuth). role: user / church_admin / super_admin |
| `churches` | 교회 마스터. slug(서브도메인), customDomain, 승인 상태, **dbName**(→ 테넌트 DB 매핑, NULL이면 프로비저닝 전) |
| `church_admins` | 누가(users) 어느 교회(churches)의 관리자인지 — 소속 검증의 근거 |
| `church_features` | **교회별 구독/기능 플래그** (announcements…, members, finance). 요금제·판매 단위가 이 테이블. 행 없음 = 허용(하위호환) |
| `admin_permissions` | 관리자 **개인** 권한. 기본 기능은 deny-list(denied 행만 차단), 민감 권한(`members_sensitive`, `finance_approve`)은 allow-list(allowed 행 필수) |
| `invitations` | 관리자 이메일 초대 토큰 |

### 폴백 콘텐츠 테이블 (announcements, images, videos, layout_settings …)

교회별 DB와 **같은 구조의 콘텐츠 테이블이 중앙 DB에도 존재**한다. 이유:
교회를 식별하지 못했거나 아직 프로비저닝 전인 요청은 중앙 DB로 폴백하기 때문
(단일 교회 배포 하위호환). 다교회 운영에선 사실상 쓰이지 않으며, 전 교회 분리
완료 후 정리 대상. ⚠️ 이 테이블들은 `tenant:migrate`가 건드리지 않으므로 엔티티
변경 시 `pnpm platform:schema-diff`로 수동 반영해야 한다.

## 교회별 DB (church_<slug>)

한 교회의 데이터 전부. 같은 DB 안이므로 서비스 간 조인이 자유롭다
(예: 헌금↔교인). `churchId` 컬럼이 일부 남아 있지만 **사용하지 않는 유물**이다
— 격리는 DB 분리 자체가 담당.

### 홈페이지 콘텐츠 (apps/web 소유)

| 테이블 | 역할 |
|---|---|
| `layout_settings`, `hero_slides` | 공개 홈 섹션 구성·배너 (커스텀 홈페이지의 핵심) |
| `announcements`, `images`, `videos`, `video_categories`, `media` | 게시 콘텐츠. media는 이미지·영상 통합 라이브러리 |
| `content_categories`, `content_pages`, `content_page_media` | 트리형 커스텀 페이지 CMS |
| `popups`, `floating_messages` | 알림 UI |
| `form_fields`, `form_submissions` | 온라인 등록/상담 폼 빌더와 제출 데이터 |
| `page_groups`, `site_config` | 부서 소개 페이지, 교회명·주소 등 사이트 설정 |

### 재적 (apps/members 소유)

| 테이블 | 역할 |
|---|---|
| `members` | 교인 카드. **phone/address는 AES-256-GCM 암호화**(`MEMBER_DATA_KEY`). `userId`(→중앙 users.id)로 홈페이지 계정과 연결 가능 |
| `families` | 가족 묶음 (members.familyId가 참조) |
| `positions` | 직분 (교회별 커스텀, 기본 시드) |
| `member_groups`, `member_group_members` | 교구>구역>셀 트리 조직과 소속(리더 포함) |
| `attendance_sessions`, `attendance_records` | 예배/모임 종류와 출석 기록 — 장기결석 감지의 원천 |
| `newcomer_stages`, `newcomer_progress` | 새가족 정착 칸반 (단계 커스텀 가능) |
| `visitations` | 심방 요청→배정→완료. `content`(수행 기록)만 민감 권한 필드 |
| `pastoral_notes` | 목양 메모 — 교역자 전용(allow-list), 열람도 로그 |
| `member_audit_logs` | 교인 데이터 생성/수정/삭제/열람 감사 로그 (개인정보보호법 접근기록) |

### 재정 (apps/finance 소유)

| 테이블 | 역할 |
|---|---|
| `fiscal_years` | 회계연도 + 이월 잔액 — 보고서 잔액 계산의 기점 |
| `departments`, `accounts` | 부서와 계정과목(수입=헌금 종류/지출 항목, 지출은 부서 연결) |
| `offering_batches` | 계수 세션 (주일 계수 1회 = 1배치, 확정 시 합계 고정) |
| `offerings` | 헌금 건별 기록 — **불변 원장**: UPDATE/DELETE 없음, 취소는 voided+사유, 정정은 replacesId로 재입력. `memberId`(→같은 DB members.id)로 교적 연결, NULL이면 무기명 |
| `expense_requests`, `expense_attachments` | 지출결의(기안→승인→지급, 승인 이력 JSON) + 영수증 파일 메타(실파일은 앱 로컬 uploads) |
| `budgets` | 연도×지출계정 예산 — 집행률·초과 경고의 기준 |
| `closing_locks` | 월/연 마감 잠금 — 잠긴 기간의 모든 금전 기록 쓰기를 차단 |
| `donation_receipts` | 기부금영수증 발급 대장(5년 보관). 발급 시점 스냅샷 + **주민번호 암호화**(`FINANCE_DATA_KEY`) |
| `finance_config` | 재정 설정 key-value (투명성 공개 여부, 단체명·고유번호) |
| `finance_audit_logs` | 금전 기록 생성/승인/취소/파일생성 감사 로그 |

## DB를 넘나드는 참조 (FK 없음 — 정수 ID만 저장)

```
중앙 users.id ◀── (교회별 DB의) members.userId, offerings.createdBy,
                   visitations.assignedTo, *_audit_logs.actorUserId …
교회별 members.id ◀── offerings.memberId, donation_receipts.memberId,
                       visitations.memberId …
```

- 중앙↔테넌트 간 참조는 **FK 제약 없이 ID 값만** 저장한다 (다른 DB라 FK 불가).
  무결성은 서비스 레이어가 담당하고, 이름 등 표시값은 필요 시점에 조회하거나
  발급물(영수증)은 스냅샷으로 고정한다.
- 테넌트 DB 안에서도 대부분 FK 없이 설계 — synchronize 마이그레이션 단순화 목적.

## 스키마 관리 규칙 (요약)

| 대상 | 방법 |
|---|---|
| 교회별 DB | 엔티티 수정 → `tenant-entities.ts` 등록 → `pnpm tenant:migrate` (전 교회 순회 synchronize, 백업 권장) |
| 중앙 DB | 자동 동기화 없음 — `pnpm platform:schema-diff`로 차이 확인 후 CREATE/ADD만 수동 적용 |
| 새 교회 | 승인 시 자동 프로비저닝(DB 생성+스키마+시드) 또는 `pnpm tenant:provision <slug>` |
