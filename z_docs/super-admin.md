# 멀티 교회 플랫폼 아키텍처

교회별 홈페이지를 제공하는 플랫폼. 최고관리자(super_admin)가 교회를 승인하고,
각 교회 관리자(church_admin)가 자기 교회 콘텐츠를 관리한다.

---

## 역할 구조

```
super_admin   플랫폼 전체 관리 (교회 승인/정지, 관리자 지정, 기능 on/off)
  └── church_admin   자신이 속한 교회 콘텐츠만 관리
        └── user     공개 페이지 열람만
```

| role | 권한 |
|---|---|
| `super_admin` | 전체 교회 목록, 신청 승인/거절, 관리자 지정, 기능 플래그 설정 |
| `church_admin` | 소속 교회 콘텐츠(공지/이미지/영상 등) CRUD |
| `user` | 공개 페이지 열람 |

> `OWNER_OPEN_ID` 환경변수와 일치하는 사용자는 로그인 시 자동으로 `super_admin` 부여.

---

## 신청 → 승인 플로우

```
1. 교회 담당자가 Google 로그인 후 /apply 페이지에서 교회 정보 제출
   → churches.status = 'pending'

2. super_admin이 /super-admin에서 신청 목록 확인
   → 승인: status = 'active', 신청자를 church_admin으로 자동 등록
   → 거절: status = 'rejected' + rejectedReason 저장

3. 승인된 교회 관리자는 /admin 에서 콘텐츠 관리 시작
```

---

## URL 구조

### Phase 1 — 패스 기반 (현재)
```
공개 페이지
  /:churchSlug                      교회 홈페이지
  /:churchSlug/announcements/:id    공지사항 상세

관리자
  /admin                            로그인
  /admin/dashboard                  교회 관리자 대시보드 (소속 교회 자동 감지)

최고관리자
  /super-admin                      교회 목록 + 신청 현황
  /super-admin/churches/:id         교회 상세 (기능 설정, 관리자 지정)

신청
  /apply                            교회 등록 신청 폼
```

### Phase 2 — 서브도메인 확장 (추후)
```
{slug}.domain.com                   교회 홈페이지
{slug}.domain.com/admin             교회 관리자
super-admin.domain.com              최고관리자
```

**전환 전략**: `ChurchResolverMiddleware` 하나만 교체.
- Phase 1: URL path `/:churchSlug` 파라미터에서 교회 식별
- Phase 2: `req.hostname` 서브도메인에서 교회 식별
- 컨트롤러/서비스는 `req.church` 객체만 사용하므로 변경 없음

---

## 데이터베이스 스키마

### 신규 테이블

**`churches`**
```
id
name              교회명
slug              URL 식별자 (유니크) — Phase 1 패스, Phase 2 서브도메인 공용
status            pending | active | suspended | rejected
description       nullable
logoUrl           nullable
address           nullable
phone             nullable
email             nullable
customDomain      nullable — 독립 도메인 연결 시 (예: gracechurch.org)
appliedBy    → users.id (신청자)
approvedBy   → users.id (승인한 super_admin, nullable)
approvedAt        nullable
rejectedReason    nullable
createdAt
updatedAt
```

**`church_admins`** — 교회↔관리자 N:M 매핑
```
id
churchId  → churches.id
userId    → users.id
createdAt
updatedAt

UNIQUE(churchId, userId)
```
> 한 관리자가 여러 교회를 담당할 수 있도록 설계 (실제로는 드문 케이스).

**`church_features`** — 교회별 기능 플래그
```
id
churchId    → churches.id
featureKey  announcements | images | videos | floating_messages
            | layout_settings | ai_assistant
isEnabled   default 1
updatedBy   → users.id
updatedAt

UNIQUE(churchId, featureKey)
```
> 교회 승인 시 모든 기능이 기본 활성화(isEnabled=1)로 자동 생성됨.

### 기존 테이블 변경

모든 콘텐츠 테이블에 `churchId` 추가 (nullable — 마이그레이션 호환):
```
announcements     + churchId → churches.id
images            + churchId → churches.id
videos            + churchId → churches.id
floatingMessages  + churchId → churches.id
layoutSettings    + churchId → churches.id
```

`users.role` 확장:
```
기존: "user" | "admin"
변경: "user" | "church_admin" | "super_admin"
```

---

## 인증 흐름

```
로그인(Google OAuth)
  → users 테이블 upsert
  → OWNER_OPEN_ID 일치 → role = 'super_admin'
  → 아니면 role 유지 (기본 'user', 승인 시 'church_admin')
  → JWT 발급 { openId, name }

API 요청마다
  → JWT 검증 → users 조회 (role 확인)
  → church_admin이면 church_admins 조회 → churchId 확보
  → super_admin이면 churchId 없이 전체 접근
```

---

## 기능 플래그 적용

**서버**: `ChurchFeatureGuard` — 비활성 기능 접근 시 403
**프론트**: 관리자 사이드바를 `church_features` 기반으로 동적 렌더링

```
GET /api/churches/my/features  → 소속 교회의 활성 기능 목록 반환
```

---

## 데이터 격리 원칙

- 모든 콘텐츠 쿼리에 `WHERE churchId = :churchId` 자동 적용
- `church_admin`은 타 교회 데이터 절대 접근 불가
- `super_admin`만 전체 교회 데이터 접근 가능

---

## 구현 단계

| 단계 | 내용 |
|---|---|
| 1 | Church/ChurchAdmin/ChurchFeature 엔티티 + 모듈, 신청→승인 API |
| 2 | 기존 엔티티 churchId 추가, 데이터 격리 (ChurchGuard) |
| 3 | church_features 기능 플래그 + 사이드바 동적 메뉴 |
| 4 | /:churchSlug 공개 라우팅, Phase 2 서브도메인 준비 |
