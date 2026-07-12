# 재정(교회 회계) 서비스 기획서

> 상태: **MVP 완료** — 계정과목·헌금 계수(불변 원장)·지출결의(승인선)·예산(초과 경고)·월 마감·월간/주간 보고서·투명성 공개 페이지(/transparency) + 어드민 화면 6종 (2026-07-12)
> **기부금영수증 완료**(집계→일괄발급→인쇄 양식→국세청 CSV, 주민번호 AES 암호화·마스킹) — 남은 것: 통장 매칭, PDF 생성(현재는 브라우저 인쇄), 국세청 포맷 실제 스펙 검증
> 전제: [tenant-db-routing.md](./tenant-db-routing.md)의 교회별 DB 구조 위에 구현.
> 재적 기획서([plan-members.md](./plan-members.md))의 교인 데이터와 연동(헌금자 매칭, 기부금영수증).
> 구현 순서상 **재적 이후** 착수. 단, 기부금영수증은 연말정산 시즌(12~1월) 전 출시가 목표.

---

## 1. 목표와 포지셔닝

**"회계를 모르는 재정부 집사님이 주일 저녁에 끝낼 수 있는 교회 재정"**

- 현실: 소형교회 재정 담당자는 비전문 자원봉사자. 엑셀 수기 장부 → 연말 기부금영수증 수작업 → 제직회 보고서 밤샘 작성이 반복된다
- 경쟁 제품(홀리키핑, 카이로스, 오직재정 등)은 회계 프로그램을 교회에 이식한 형태 — 기능은 많지만 "차변/대변"부터 막힌다
- 우리의 원칙:
  1. **단식부기(현금 수지) 기본** — 교회 실무 관행. 복식부기는 옵션도 아님(2단계 검토)
  2. **입력은 두 곳뿐** — 헌금(수입)과 지출결의(지출). 나머지는 전부 자동 집계
  3. **투명성을 제품화** — 버튼 하나로 제직회 보고서, 원하면 홈페이지 공개. 재정 투명성은 한국 교회의 최대 민감 이슈이자 우리의 소구점

### 성공 지표

| 지표 | 목표 |
|---|---|
| 주간 헌금 입력 소요 시간 | 봉투 100매 기준 15분 이내 |
| 월 결산 마감 소요 | 클릭 3회 (자동 집계 + 마감 잠금) |
| 기부금영수증 발급 | 연말 일괄 발급 10분 이내, 국세청 제출 파일 자동 생성 |
| 재정 기능 유료 전환율 | 재적 사용 교회의 40% |

## 2. 교회 회계 도메인 정리 (구현 전 필수 이해)

- **회계연도**: 대부분 1/1~12/31. 연말 공동의회에서 차년도 예산 승인
- **수입 구조**: 헌금이 90% 이상. 종류 = 십일조, 주정헌금(주일헌금), 감사헌금, 선교헌금, 건축헌금, 절기헌금(부활절/추수감사/성탄), 작정헌금, 기타(이자, 임대 등)
- **지출 구조**: 부서/위원회 단위 예산 (예배부, 교육부, 선교부, 관리부…) + 인건비(사례비) + 운영비
- **헌금 처리 절차**: 주일 예배 후 재정부원 2인 이상이 계수 → 봉투별 기록(무기명 포함) → 계수표 작성 → 월요일 은행 입금
- **지출 절차**: 부서가 지출결의서 기안(영수증 첨부) → 재정부장/담임목사 승인 → 회계가 집행·기록
- **보고**: 주보(주간 헌금 총액), 월 재정보고(재직회), 연 결산(공동의회, 감사 2인 감사 후)
- **기부금영수증**: 소득세법상 지정기부금 단체로서 발급. 연말정산 간소화(국세청 홈택스) 자료 제출 가능. 발급명세 5년 보관 의무
- **잠금 문화**: 결산 확정 후 과거 수정 금지 — 수정이 아니라 "취소 + 재입력"으로 흔적을 남겨야 감사에서 문제가 없다

## 3. 기능 명세

### 3.1 MVP

**A. 계정과목(항목) 관리**
- 수입/지출 2트리. 기본 세트 시드(위 도메인 기준) + 교회별 추가/이름변경/보관
- 지출 항목은 부서와 연결(예산 단위)

**B. 헌금 입력 — "계수 모드"** ★ 핵심 UX
- 주일 저녁 시나리오 최적화: 날짜·예배 선택 → 봉투 단위 연속 입력
  - 이름 자동완성(재적 members 연동, 동명이인은 소속으로 구분) / **무기명** 버튼
  - 헌금 종류 버튼식 선택(십일조/감사/주정…), 금액 키패드, Enter로 다음 봉투
  - 봉투번호(선택), 수표/현금/계좌 구분
- 실시간 계수 합계 → 종료 시 **계수표 자동 생성**(종류별·방법별 합계, 계수자 서명란 PDF)
- 계좌이체 헌금: 통장 내역 붙여넣기/CSV 업로드 → 이름·금액 파싱 → 교인 매칭 제안 → 확정
- 수정은 마감 전 자유, 마감 후는 취소+재입력(둘 다 이력 보존)

**C. 지출결의**
- 기안(모바일 가능): 부서/항목/금액/내용 + **영수증 사진 첨부**
- 승인선: 교회별 설정(1단계~2단계: 재정부장 → 담임목사). 승인/반려(사유)
- 승인 완료 → 회계가 지급 처리(날짜, 지급 방법) → 장부 자동 기입
- 카톡/이메일 승인 알림(2단계)

**D. 예산**
- 부서 × 계정과목 단위 연간 예산 편성 (전년 집행액 참고 표시)
- 집행 현황: 예산 대비 집행률, 잔액. 부서 담당자는 자기 부서만 조회
- 예산 초과 지출결의 시 경고(차단 아님 — 교회 현실상 초과 집행 흔함)

**E. 장부·보고서**
- 수입/지출 원장(현금출납부): 기간·항목·부서 필터, 잔액 러닝
- 주간 보고: 주보용 헌금 요약(익명 — 총액·종류별)
- 월간 보고: 수입/지출 집계표, 예산 대비, 전월 잔액 → 당월 잔액 (제직회용 PDF)
- 연간 결산서: 공동의회 양식 (수입/지출 총괄 + 부서별 명세)
- **재정 투명성 페이지(선택)**: 교회가 켜면 홈페이지에 월간 요약 자동 게시 ★ 차별화

**F. 마감**
- 월 마감: 담당자가 확인 후 잠금 → 해당 월 기록 수정 불가(취소+재입력만)
- 연 마감: 감사 완료 체크 → 회계연도 잠금, 이월 잔액 자동 생성

**G. 감사 추적**
- 모든 금전 기록의 생성/취소/재입력 이력, 승인 이력, 열람 로그
- 감사(監査)용 뷰: 특정 기간 전체 기록 + 변경 이력 + 증빙 일괄 열람

### 3.2 2단계

- **기부금영수증** (연말정산 시즌 전 필수 완성)
  - 교인별 연간 헌금 집계(무기명 제외) → 일괄/개별 발급, 일련번호 자동 채번
  - 필수 기재: 단체명·고유번호, 기부자 성명·주민번호(발급 시에만 입력받아 암호화 저장), 기부 유형·금액, 기부일
  - PDF 발급 + 이메일/카톡 전송, 발급대장 5년 보관
  - **국세청 연말정산 간소화 제출 파일** 생성(홈택스 기부금 자료 업로드 포맷) — 매년 1월 재정 담당자 최대 고통을 해결하는 킬러 기능
- 통장 자동 연동(오픈뱅킹/스크래핑) — 입금 자동 매칭
- 영수증 사진 AI-OCR: 금액·상호 자동 추출 → 항목 추천
- 작정헌금 관리(건축 등): 작정액 대비 납입 현황
- 사례비 지급 관리(원천세는 범위 외 — 세무사 연계 안내)

### 3.3 하지 않는 것

- 복식부기·재무제표(대차대조표) — 타깃 교회에 불필요, 요구 오면 2단계 검토
- 원천징수/4대보험 신고 — 세무 영역, 책임 소재 위험. 제휴로 해결
- 헌금 PG 결제(카드 헌금) — 수수료·가맹 이슈. 계좌이체 매칭으로 시작

## 4. 데이터 모델 초안 (테넌트 DB)

> 금액은 `DECIMAL(15,0)` KRW 정수. 금전 레코드는 **UPDATE/DELETE 금지** — 상태 변경과 취소 레코드로만 처리.

```sql
CREATE TABLE fiscal_years (
  id, year INT UNIQUE, status ENUM('open','closed') DEFAULT 'open',
  openingBalance DECIMAL(15,0) DEFAULT 0, closedAt TIMESTAMP NULL, closedBy INT NULL
);

CREATE TABLE accounts (               -- 계정과목 트리
  id, parentId INT NULL, kind ENUM('income','expense'),
  name VARCHAR(100), departmentId INT NULL COMMENT '지출 항목의 부서 연결',
  isBuiltIn TINYINT(1) DEFAULT 0, displayOrder INT,
  status ENUM('active','archived') DEFAULT 'active'
);

CREATE TABLE departments ( id, name VARCHAR(100), displayOrder INT );

-- 헌금 (수입 원천)
CREATE TABLE offerings (
  id, date DATE, serviceType VARCHAR(50) COMMENT '주일1부/수요 등',
  accountId INT COMMENT '헌금 종류(수입 계정)',
  memberId INT NULL COMMENT '재적 members.id — NULL이면 무기명',
  donorName VARCHAR(50) NULL COMMENT '교적 미연결 헌금자',
  amount DECIMAL(15,0), method ENUM('cash','check','transfer'),
  envelopeNo VARCHAR(20) NULL,
  batchId INT NULL COMMENT '계수 세션',
  status ENUM('confirmed','voided') DEFAULT 'confirmed',
  voidedBy INT NULL, voidedAt TIMESTAMP NULL, voidReason VARCHAR(255) NULL,
  replacesId INT NULL COMMENT '재입력 시 원 레코드',
  createdBy INT, createdAt TIMESTAMP,
  INDEX (date), INDEX (memberId, date), INDEX (accountId, date)
);
CREATE TABLE offering_batches (       -- 계수 세션
  id, date DATE, serviceType VARCHAR(50), counters JSON COMMENT '계수자 명단',
  totalAmount DECIMAL(15,0), status ENUM('counting','confirmed') , confirmedAt TIMESTAMP NULL
);

-- 지출
CREATE TABLE expense_requests (       -- 지출결의서
  id, requestNo VARCHAR(20) UNIQUE COMMENT '연번 2026-001',
  departmentId INT, accountId INT, amount DECIMAL(15,0),
  title VARCHAR(255), description TEXT NULL,
  requestedBy INT, requestedAt TIMESTAMP,
  status ENUM('draft','pending','approved','rejected','paid','voided'),
  approvals JSON COMMENT '[{step, approverId, action, at, comment}]',
  paidAt DATE NULL, paidMethod ENUM('cash','transfer','card') NULL, paidBy INT NULL,
  INDEX (status), INDEX (departmentId, paidAt)
);
CREATE TABLE expense_attachments ( id, expenseRequestId INT, fileKey VARCHAR(512), fileName, mimeType );

-- 통합 원장 (헌금·지출 확정 시 자동 기입, 조회 전용)
CREATE TABLE ledger_entries (
  id, date DATE, kind ENUM('income','expense'),
  accountId INT, departmentId INT NULL, amount DECIMAL(15,0),
  sourceType ENUM('offering','expense','adjustment','carryover'),
  sourceId INT NULL, description VARCHAR(255),
  fiscalYearId INT, createdAt TIMESTAMP,
  INDEX (fiscalYearId, date), INDEX (accountId, date)
);

-- 예산
CREATE TABLE budgets (
  id, fiscalYearId INT, departmentId INT NULL, accountId INT,
  amount DECIMAL(15,0), UNIQUE (fiscalYearId, departmentId, accountId)
);

-- 마감
CREATE TABLE closing_locks (
  id, year INT, month INT NULL COMMENT 'NULL=연 마감',
  lockedBy INT, lockedAt TIMESTAMP, UNIQUE (year, month)
);

-- 기부금영수증 (2단계)
CREATE TABLE donation_receipts (
  id, receiptNo VARCHAR(30) UNIQUE COMMENT '2026-0001',
  memberId INT, year INT, totalAmount DECIMAL(15,0),
  donorRrn VARBINARY(256) NULL COMMENT '주민번호 AES 암호화 — 발급 시에만 수집',
  issuedAt TIMESTAMP, issuedBy INT, canceledAt TIMESTAMP NULL,
  INDEX (year, memberId)
);

CREATE TABLE finance_audit_logs (
  id, actorUserId INT, action VARCHAR(50), targetType VARCHAR(50), targetId INT,
  detail JSON, createdAt TIMESTAMP, INDEX (actorUserId, createdAt)
);
```

### 설계 원칙

1. **불변 원장**: `offerings`/`ledger_entries`는 수정·삭제 대신 `voided` + `replacesId` — 감사 대응의 핵심
2. **마감 검사**: 쓰기 API는 `closing_locks` 확인 후 거부 (서비스 레이어 공통 가드)
3. **재적 연동**: `offerings.memberId` → 같은 테넌트 DB의 `members.id`. 교적 없이 재정만 쓰는 교회를 위해 `donorName` 폴백
4. **주민번호**: 기부금영수증 발급 시에만 수집, AES-256-GCM 암호화, 열람 로그 필수, 영수증 외 용도 사용 금지

## 5. 권한 모델

| permKey | 대상 | 범위 |
|---|---|---|
| `finance` | 회계 담당 | 헌금 입력, 지출 집행, 장부, 보고서 |
| `finance_approve` | 재정부장·담임목사 | 지출결의 승인, 마감, 영수증 발급 |
| `finance_request` | 부서 담당자 | 지출결의 기안 + 자기 부서 예산 조회만 |
| `finance_audit` | 감사 | 전체 조회 전용 + 변경 이력 |

- 개인별 헌금 내역은 `finance` 이상만 조회 (교역자라도 `members` 권한만으로는 못 봄 — 헌금 정보와 목양 정보의 분리는 신뢰의 핵심)
- 모든 금전 기록 접근은 `finance_audit_logs` 기록

## 6. API 초안

```
GET/POST/PATCH /api/finance/accounts          · /departments · /fiscal-years
POST   /api/finance/offering-batches          (계수 시작) · POST .../:id/confirm
POST   /api/finance/offerings                 (봉투 연속 입력, batch 내)
POST   /api/finance/offerings/import-transfer (통장 내역 매칭)
POST   /api/finance/offerings/:id/void        { reason }
GET    /api/finance/offerings?from=&to=&accountId=&memberId=

POST   /api/finance/expenses                  (기안) · POST .../:id/approve|reject|pay|void
GET    /api/finance/expenses?status=&departmentId=

GET/PUT /api/finance/budgets?year=            · GET /api/finance/budgets/status
GET    /api/finance/ledger?year=&month=&accountId=
GET    /api/finance/reports/weekly|monthly|annual?…   (+ ?format=pdf)
POST   /api/finance/closings                  { year, month } · DELETE (super 승인 필요)

POST   /api/finance/receipts/issue            { year, memberIds[] }   (2단계)
GET    /api/finance/receipts/nts-file?year=   (국세청 제출 파일)
```

## 7. 화면 구성 (`/admin/finance/...`)

1. **대시보드** — 이번 달 수입/지출/잔액, 예산 집행률 상위, 승인 대기 결의서
2. **헌금 계수** — 전용 풀스크린 모드(키보드 우선), 계수표 출력
3. **헌금 장부** — 필터 표, 통장 매칭 탭
4. **지출결의** — 기안함/승인함/지급함 (모바일: 기안 + 사진 첨부)
5. **예산** — 편성 시트(부서×항목 그리드), 집행 현황
6. **보고서** — 주간/월간/연간, PDF 미리보기·다운로드, 투명성 페이지 설정
7. **마감·감사** — 마감 캘린더, 감사 뷰
8. (2단계) **기부금영수증** — 연간 집계 → 일괄 발급 → 국세청 파일

## 8. 구현 순서

| 순서 | 작업 | 비고 |
|---|---|---|
| 1 | fiscal_years/accounts/departments + 기본 시드 | 재적의 PermissionGuard 재사용 |
| 2 | 헌금: 계수 모드 + 장부 + 계수표 PDF | 가장 자주 쓰는 기능 — UX에 최대 투자 |
| 3 | ledger_entries 자동 기입 + 월 마감 | 불변 원장 원칙 확립 |
| 4 | 지출결의(기안→승인→지급) + 첨부 | storage 모듈 재사용 |
| 5 | 예산 편성/집행 | |
| 6 | 보고서(주간/월간/연간 PDF) + 투명성 페이지 | public-home 패턴 재사용 |
| 7 | 통장 내역 임포트 매칭 | |
| 8 | **기부금영수증 + 국세청 파일** | ⏰ 12월 전 완성 목표 |

기능 플래그: `church_features`에 `finance` featureKey → 유료 플랜 구분.

## 9. 요금제와의 관계 (참고)

| 플랜 | 구성 | 가격(안) |
|---|---|---|
| 무료 | 홈페이지 + 교적 50인 | 0원 |
| 스탠다드 | + 교적 무제한 + 출석/새가족/심방 | 월 2~3만원 |
| 플러스 | + 재정 전체 + 기부금영수증 | 월 5~7만원 |

재정은 최상위 플랜 견인 기능. "기부금영수증 시즌"(12~1월)이 최대 전환 시점.

## 10. 리스크

| 리스크 | 대응 |
|---|---|
| 금액 계산 버그 = 신뢰 사망 | 불변 원장 + 이중 집계 검증(원천 합계 vs ledger 합계 크로스체크 배치) + **금전 로직 유닛 테스트 필수**(이 모듈부터 테스트 도입) |
| 세법(기부금영수증) 요건 변경 | 발급 로직을 연도별 정책 테이블로 분리, 매년 11월 요건 점검 |
| 주민번호 취급 부담 | 발급 시에만 수집·암호화·로그. 미입력 시 영수증에 생년월일 대체 옵션 안내 |
| 기존 수기 장부에서 이전 | 연도 중간 시작 지원: 기초잔액 + 월별 합계만 입력하는 "간이 이월" 모드 |
| 승인자가 고령 | 승인은 카톡 링크 → 원클릭 (2단계), 그 전까지 회계가 대리 승인 기록 |
