# 재적(교인 관리) 서비스 기획서

> 상태: 기획 (구현 전) · 작성일: 2026-07-12
> 전제: [tenant-db-routing.md](./tenant-db-routing.md)의 교회별 DB 구조 위에 구현.
> 재정 기획서([plan-finance.md](./plan-finance.md))와 교인 데이터를 공유(헌금자 매칭).

---

## 1. 목표와 포지셔닝

**"엑셀과 종이 교적부를 쓰는 교회가 교육 없이 10분 만에 넘어올 수 있는 교인 관리"**

- 한국 교회 약 70%가 100명 미만 소형교회 — 전담 행정 인력이 없어 기존 프로그램(오직, OKSolomon, 온맘 등)을 사놓고도 못 쓴다
- 경쟁 제품의 공통 약점: 2000년대 ERP식 UI, 데스크톱 중심, 홈페이지·재정과 분리된 데이터
- 우리의 무기: **홈페이지 계정 = 교적**. 교인이 홈페이지에 가입하면 교적이 생기고, 본인 정보를 스스로 최신화한다. 관리자가 세 번 입력할 것을 한 번으로

### 성공 지표 (출시 6개월)

| 지표 | 목표 |
|---|---|
| 교적 등록 교회 수 | 30곳 (무료 포함) |
| 교회당 주간 활성 관리자 | 2명 이상 (담당자 1인 의존 탈피) |
| 출석 체크 모바일 비율 | 50% 이상 |
| 엑셀 임포트로 시작한 교회 비율 | 70% 이상 (데이터 이사가 안 막힌다는 증거) |

## 2. 사용자(페르소나)와 핵심 시나리오

| 사용자 | 하는 일 | 대표 시나리오 |
|---|---|---|
| 담임목사 | 전체 현황 파악, 심방 | "3주째 안 보이는 성도가 누구지?" → 대시보드 장기결석 목록 |
| 부교역자/전도사 | 부서 관리, 새가족 정착 | 새가족 등록 → 4주 과정 체크 → 정착 완료 처리 |
| 사무간사/서기 | 교적 입력·수정, 주소록 출력 | 엑셀 교적을 임포트, 심방 배정표 인쇄 |
| 셀리더/구역장 | 모임 출석 체크, 심방 요청 | 주일 오후 폰에서 셀원 출석 체크, "김집사님 병원 입원" 심방 요청 |
| 성도 본인 | 내 정보 관리 | 이사 후 홈페이지 마이페이지에서 주소 변경 |

## 3. 기능 명세

### 3.1 MVP (1차 출시 범위)

**A. 교인 카드**
- 기본 정보: 이름, 사진, 성별, 생년월일(음/양), 연락처, 주소, 이메일
- 신앙 정보: 신급(원입/학습/세례/입교/유아세례), 세례일·세례교회, 직분(성도/집사/안수집사/권사/장로/전도사/목사, 교회별 커스텀 가능), 임직일
- 상태: 재적 상태(출석/장기결석/이명/별세/제적), 등록일, 등록 경로
- 가족 묶음: 가족 단위 카드(세대주 기준), 가족 관계(배우자/자녀/부모), 가족 전체 보기
- 메모: 일반 메모(관리자 공유) / **목양 메모(교역자 전용, 권한 분리)**

**B. 조직 관리**
- 트리 구조: 교구 > 구역 > 셀, 부서(유치부~장년부), 찬양대, 봉사팀 등 임의 조직
- 조직별 리더 지정(교인 계정과 연결) → 리더는 자기 조직만 열람·출석체크 가능
- 한 교인이 여러 조직 소속 가능(장년 2교구 + 찬양대)

**C. 새가족 파이프라인** ★ 차별화
- 등록 → 새가족반 → 수료 → 정착(조직 배정) 단계를 **칸반 보드**로 시각화
- 단계별 담당자 지정, 경과일 표시("등록 3주차"), 지연 시 강조
- 새가족 등록 폼은 기존 form-fields 모듈 재사용 (홈페이지 온라인 등록과 연결)

**D. 출석**
- 예배/모임 단위 출석 세션(주일 1부, 수요, 셀모임…) — 교회별로 예배 종류 설정
- 체크 방식: ① 관리자 명단 체크(데스크톱) ② 셀리더 모바일 체크 ③ QR 셀프 체크(2단계)
- 출석 통계: 예배별 추이, 조직별 출석률, 개인별 출석 이력

**E. 심방** 
- 흐름: 요청(리더/본인) → 배정(교역자) → 수행 → 기록
- 기록은 목양 메모와 동일 권한(교역자 전용)
- 심방 대상 추천: 장기결석자, 새가족, 경조사 등록자

**F. 장기결석 자동 감지** ★ 차별화
- N주(기본 4주) 연속 미출석 시 대시보드 + 담당 리더에게 표시
- "통계를 보여주는" 경쟁사와 달리 **행동(심방)으로 연결**되는 것이 목적

**G. 검색·필터·대시보드**
- 복합 필터: 조직 × 직분 × 신급 × 상태 × 나이대 × 출석 패턴 ("청년부에서 3주 이상 결석" 등)
- 대시보드: 재적/출석 추이, 새가족 현황, 장기결석 목록, 금주 심방 예정
- 생일/경조사 위젯 (이번 주 생일자)

**H. 데이터 이사** ★ 진입 장벽 제거
- 엑셀 임포트: 컬럼 매핑 UI(이름/연락처/직분… 자동 추측), 중복 검사, 실패 행 리포트
- 전체 익스포트(엑셀) — "데이터를 인질로 잡지 않는다"는 신뢰 = 영업 포인트

### 3.2 2단계

- 교인 셀프서비스: 홈페이지 계정 연동(마이페이지에서 본인·가족 정보 수정 → 관리자 승인)
- QR 출석(주보에 인쇄된 교회 QR → 교인이 스캔)
- 문자/카카오 알림톡: 심방 배정, 생일 축하, 결석 팔로업
- 교적 카드/주소록/조직도 인쇄 (PDF)
- 임직/이명 증명서 발급
- 통계 리포트: 연령 피라미드, 정착률(새가족 6개월 잔존), 지역 분포

### 3.3 하지 않는 것 (명시적 제외)

- 주민등록번호 수집 — 받지 않는다 (기부금영수증은 재정 모듈에서 별도 암호화 처리)
- 그룹웨어/결재/급여 — 만나ERP 영역, 우리 타깃(소형교회)에 불필요
- 자체 메신저 — 카카오톡을 이길 수 없다. 알림톡 연동으로 대체

## 4. 데이터 모델 초안 (테넌트 DB)

> 전부 `tenant-entities.ts`에 등록 → 교회별 DB에 생성. churchId 컬럼 불필요.

```sql
-- 교인
CREATE TABLE members (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  userId        INT NULL COMMENT '중앙 DB users.id — 홈페이지 계정 연동(셀프서비스)',
  name          VARCHAR(50) NOT NULL,
  photoUrl      VARCHAR(1024) NULL,
  gender        ENUM('m','f') NULL,
  birthDate     DATE NULL,
  isLunarBirth  TINYINT(1) NOT NULL DEFAULT 0,
  phone         VARBINARY(256) NULL COMMENT 'AES 암호화',
  address       VARBINARY(512) NULL COMMENT 'AES 암호화',
  email         VARCHAR(320) NULL,
  baptismLevel  ENUM('visitor','wonip','haksup','baptized','confirmed','infant') NULL,
  baptizedAt    DATE NULL,
  positionId    INT NULL COMMENT 'positions.id',
  status        ENUM('active','absent_long','transferred','deceased','removed') NOT NULL DEFAULT 'active',
  familyId      INT NULL,
  familyRole    ENUM('head','spouse','child','parent','etc') NULL,
  registeredAt  DATE NULL,
  registerPath  VARCHAR(100) NULL COMMENT '지인 소개/전도/이사 등',
  memo          TEXT NULL COMMENT '일반 메모(관리자 공유)',
  createdAt/updatedAt TIMESTAMP
);

CREATE TABLE families ( id, headMemberId INT NULL, addressLabel VARCHAR(100) NULL );

CREATE TABLE positions (      -- 직분 (교회별 커스텀)
  id, name VARCHAR(50), displayOrder INT, isBuiltIn TINYINT(1)
);

-- 조직 (트리)
CREATE TABLE member_groups (
  id, parentId INT NULL, type ENUM('parish','cell','department','team'),
  name VARCHAR(100), leaderMemberId INT NULL, displayOrder INT,
  status ENUM('active','archived') DEFAULT 'active'
);
CREATE TABLE member_group_members (
  id, groupId INT, memberId INT, role ENUM('leader','member') DEFAULT 'member',
  UNIQUE (groupId, memberId)
);

-- 출석
CREATE TABLE attendance_sessions (   -- 예배/모임 종류
  id, name VARCHAR(100) COMMENT '주일 1부, 수요예배, 셀모임…',
  groupId INT NULL COMMENT '조직 모임이면 해당 조직', displayOrder INT
);
CREATE TABLE attendance_records (
  id, sessionId INT, memberId INT, date DATE,
  status ENUM('present','absent','online') DEFAULT 'present',
  checkedBy INT NULL COMMENT '중앙 users.id',
  UNIQUE (sessionId, memberId, date), INDEX (memberId, date)
);

-- 새가족 파이프라인
CREATE TABLE newcomer_stages ( id, name VARCHAR(50), displayOrder INT );  -- 커스텀 가능
CREATE TABLE newcomer_progress (
  id, memberId INT UNIQUE, stageId INT, assignedTo INT NULL,
  enteredStageAt DATE, note TEXT NULL, completedAt DATE NULL
);

-- 심방·목양 (민감)
CREATE TABLE visitations (
  id, memberId INT, requestedBy INT NULL, assignedTo INT NULL,
  type ENUM('regular','hospital','new','event','urgent'),
  status ENUM('requested','assigned','done','canceled'),
  scheduledAt DATE NULL, content TEXT NULL COMMENT '교역자 전용',
  createdAt TIMESTAMP
);
CREATE TABLE pastoral_notes (        -- 목양 메모 (교역자 전용)
  id, memberId INT, authorId INT, content TEXT, createdAt TIMESTAMP
);

-- 감사 로그 (개인정보보호법)
CREATE TABLE member_audit_logs (
  id, actorUserId INT, action ENUM('view','create','update','delete','export'),
  targetType VARCHAR(50), targetId INT NULL, detail JSON NULL, createdAt TIMESTAMP,
  INDEX (actorUserId, createdAt)
);
```

### 중앙 DB와의 연결

- `members.userId` → 중앙 `users.id` (nullable). 홈페이지 로그인 계정과 교적의 연결 고리
- 초대 흐름: 관리자가 교인 카드에서 "계정 초대" → 이메일/카톡 링크 → 가입 시 자동 연결 (기존 invitations 모듈 패턴 재사용)

## 5. 권한 모델

기존 `admin_permissions` (중앙 DB, permKey 방식)를 확장:

| permKey | 대상 | 범위 |
|---|---|---|
| `members` | 사무간사 등 | 교인 CRUD, 조직, 출석, 엑셀 |
| `members_sensitive` | 교역자 | + 목양 메모, 심방 내용 열람 |
| `members_readonly_group` | 셀리더 | **자기 조직만** 명단·출석 (연락처 마스킹 옵션) |

- 셀리더는 church_admin이 아니라 **교인 계정(users) + 조직 리더 지정**으로 권한 획득 → 관리자 계정 남발 방지
- 모든 개인정보 열람·수정·익스포트는 `member_audit_logs`에 기록

## 6. 개인정보보호법 체크리스트 (구현 요구사항)

- [ ] 수집·이용 동의: 교인 등록 시 동의 항목 저장(동의일, 동의 방법). 온라인 등록 폼에 동의 체크 내장
- [ ] 암호화: 연락처·주소는 AES-256-GCM 컬럼 암호화(키는 env, 교회별 키 파생). 사진은 S3 비공개 버킷
- [ ] 접근 통제: 위 권한 모델 + 세션 필수. 공개 API에 교인 데이터 절대 노출 금지
- [ ] 접근 기록: 열람 포함 감사 로그 1년 보관
- [ ] 파기: 제적/탈퇴 교인 별도 보관함 → 보존 기한(기본 5년, 교회 설정) 후 자동 파기. 교회 해지 시 테넌트 DB 통째 백업 제공 후 삭제
- [ ] 주민등록번호 미수집 원칙
- [ ] 개인정보 처리방침 템플릿을 교회 홈페이지에 자동 게시(플랫폼이 제공)

→ **"개인정보보호법을 대신 지켜드립니다"가 그 자체로 영업 문구가 됨** (기존 제품 대부분 미비)

## 7. API 초안

```
GET    /api/members?query=&groupId=&status=&baptism=&position=&absentWeeks=
POST   /api/members                    · PATCH/DELETE /api/members/:id
GET    /api/members/:id                (권한에 따라 민감 필드 마스킹)
POST   /api/members/import             (엑셀) · GET /api/members/export
GET    /api/members/:id/attendance     · GET /api/members/:id/timeline (출석+심방+단계 통합)

GET/POST/PATCH/DELETE /api/member-groups          (트리)
GET    /api/member-groups/:id/members             · POST .../members (배정)

GET/POST /api/attendance-sessions
POST   /api/attendance/check           { sessionId, date, records: [{memberId, status}] }
GET    /api/attendance/stats?sessionId=&from=&to=&groupId=

GET/PATCH /api/newcomers               (칸반 보드용) · POST /api/newcomers/:id/advance

GET/POST/PATCH /api/visitations        · GET /api/members/:id/pastoral-notes (교역자 전용)

GET    /api/members/dashboard          (재적 통계, 장기결석, 생일, 새가족 현황)
```

모두 `AdminGuard`(+ 신설 `PermissionGuard(permKey)`) 적용, 테넌트 DB 자동 라우팅.

## 8. 화면 구성 (관리자 `/admin/members/...`)

1. **대시보드** — 재적/출석 카드, 장기결석 목록(→심방 요청 버튼), 이번 주 생일, 새가족 현황
2. **교인 목록** — 표+필터, 일괄 작업(조직 배정, 상태 변경), 엑셀 임포트/익스포트
3. **교인 상세** — 카드형: 기본/신앙/가족/조직 탭 + 타임라인(출석·심방·단계 이력)
4. **조직도** — 트리 편집(드래그), 조직 클릭 → 명단·출석률
5. **새가족 보드** — 칸반 (단계별 카드, 드래그로 단계 이동)
6. **출석 체크** — 세션·날짜 선택 → 명단 체크 (모바일 우선 레이아웃)
7. **심방 관리** — 요청함/배정/완료 목록, 심방 기록 작성
8. (셀리더용 모바일 뷰) — 내 조직 명단 + 출석 체크 + 심방 요청만

UI는 기존 shadcn/ui + `useCRUD` 훅 패턴 재사용. 모바일 뷰가 1급 시민(셀리더 시나리오).

## 9. 구현 순서 (기존 코드 연결점 포함)

| 순서 | 작업 | 비고 |
|---|---|---|
| 1 | `PermissionGuard(permKey)` + admin_permissions 심사 로직 | AdminGuard 확장. 재정 모듈도 같이 씀 |
| 2 | members/families/positions 엔티티 + CRUD + 목록 화면 | `tenant-entities.ts` 등록, `TenantOrmModule.forFeature` |
| 3 | 엑셀 임포트/익스포트 | 진입 장벽 제거가 최우선이라 앞에 배치 |
| 4 | 조직(member_groups) + 조직도 화면 | |
| 5 | 출석 세션/기록 + 모바일 체크 화면 + 통계 | |
| 6 | 새가족 파이프라인(칸반) | 홈페이지 form-fields 연동 |
| 7 | 심방 + 목양 메모 (권한 분리) | |
| 8 | 대시보드 + 장기결석 감지 | |
| 9 | 암호화·감사 로그·동의 관리 | 출시 전 필수 |

기능 플래그: `church_features`에 `members` featureKey 추가 → 요금제 구분에 사용.

## 10. 리스크

| 리스크 | 대응 |
|---|---|
| 교회마다 직분/조직 체계가 다름 | positions·groups·stages 전부 커스텀 가능 + 합리적 기본값 시드 |
| 민감정보 유출 사고 = 서비스 사망 | 교회별 DB 분리(완료) + 암호화 + 감사 로그 + 권한 3단계 |
| 담당자가 IT에 약함 | 엑셀 임포트, 기본값, 온보딩 체크리스트. "설정 없이 시작" 원칙 |
| 셀리더 참여 저조 | 리더 화면은 3탭 이하 초단순 모바일 뷰로 별도 설계 |
