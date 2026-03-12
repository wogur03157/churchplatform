# 영신교회 메뉴 구조 재편 — 구현 문서

> 작성일: 2026-03-03
> 상태: 구현 대기 중

---

## 1. 변경 범위 요약

| 영역 | 신규 파일 | 수정 파일 |
|------|-----------|-----------|
| 서버 mock | 5개 컨트롤러 추가 | mock-data.controller.ts, mock.module.ts |
| 클라이언트 컴포넌트 | 2개 | PublicView.tsx, DashboardLayout.tsx |
| 공개 페이지 | 13개 | App.tsx |
| 관리자 페이지 | 4개 | Videos.tsx, App.tsx |

---

## 2. 서버 변경

### 2-1. videos mock — category 필터 추가
**파일:** `server/modules/mock/mock-data.controller.ts`

- VIDEOS 데이터에 `category` 필드 추가 (예: `"sunday"`, `"wednesday"`, `"friday"`, `"easter"`)
- `GET /videos?category=sunday` 쿼리 파라미터 필터 지원
- `POST/PATCH /videos` body에 category 포함

### 2-2. MockVideoCategoriesController (신규)
**파일:** `server/modules/mock/mock-data.controller.ts`에 추가

```
GET  /video-categories        → 카테고리 목록
POST /video-categories        → 생성
PATCH /video-categories/:id   → 수정
DELETE /video-categories/:id  → 삭제 (isBuiltIn=false만)
```

기본 데이터:
| name | slug | isBuiltIn |
|------|------|-----------|
| 주일예배 | sunday | true |
| 수요예배 | wednesday | true |
| 금요예배 | friday | true |
| 부활절 | easter | false |
| 성탄절 | christmas | false |

### 2-3. MockPageGroupsController (신규)

```
GET  /page-groups?groupKey=departments  → 소그룹 목록 (필터)
POST /page-groups                        → 생성
PATCH /page-groups/:id                   → 수정
DELETE /page-groups/:id                  → 삭제
```

groupKey 값: `"departments"` | `"god-love"` | `"neighbor-love"`

기본 데이터 (각 groupKey 별 2~3개):
- departments: 유아부, 아동부, 청년부 …
- god-love: 새벽기도, 성경공부 …
- neighbor-love: 지역사회봉사, 푸드뱅크 …

### 2-4. MockFormFieldsController (신규)

```
GET   /form-fields        → 폼 필드 목록
POST  /form-fields        → 생성
PATCH /form-fields/:id    → 수정
DELETE /form-fields/:id   → 삭제
```

기본 데이터:
| label | fieldType | required |
|-------|-----------|----------|
| 이름 | text | true |
| 연락처 | number | true |
| 방문목적 | dropdown | true (allowOther=true) |

### 2-5. MockFormSubmissionsController (신규)

```
POST /form-submissions     → 신청 접수 (공개)
GET  /form-submissions     → 신청 내역 조회 (관리자)
```

### 2-6. MockSiteConfigController (신규)

```
GET   /site-config         → 전체 설정 조회 (공개)
PATCH /site-config/:key    → 값 수정 (관리자)
```

기본 데이터:
| key | value |
|-----|-------|
| church_name | 영신교회 |
| map_address | 목동로 19길 28 |
| map_embed_url | (빈 값) |

---

## 3. 클라이언트 컴포넌트

### 3-1. PublicHeader.tsx (신규)
**경로:** `client/src/components/PublicHeader.tsx`

**데스크탑:** 5개 대메뉴 → hover 드롭다운 → (groupKey 있으면) fly-out 3단계
**모바일:** 햄버거 → 슬라이드 패널 → 아코디언

NAV_MENU 구조:
```
교회소개  → 영신교회 / 예배안내 / 오시는길
설교      → 주일설교 / 수요·금요 / 특별설교
공동체    → 부서소개(groupKey=departments) / 작은교회 / 새가족안내
사역과양육 → 하나님사랑(groupKey=god-love) / 이웃사랑(groupKey=neighbor-love)
교회소식  → 공지사항 / 사역게시판
```

groupKey가 있는 메뉴는 `GET /page-groups?groupKey=xxx` fetch 후 3단계 동적 렌더링.

### 3-2. PublicPageLayout.tsx (신규)
**경로:** `client/src/components/PublicPageLayout.tsx`

- `<PublicHeader />` + `<main>` + `<footer>` 포함
- 공개 페이지 전체의 공통 wrapper

---

## 4. 공개 페이지 (신규)

**디렉토리:** `client/src/pages/public/`

| 파일 | URL | 내용 |
|------|-----|------|
| ChurchAbout.tsx | /church/about | 교회 소개 (정적) |
| ChurchWorship.tsx | /church/worship | 예배 시간표 (정적 표) |
| ChurchDirections.tsx | /church/directions | Kakao Maps 링크 + site-config의 map_address 사용 |
| SermonList.tsx | (재사용 컴포넌트) | category prop → GET /videos?category=xxx |
| SundaySermons.tsx | /sermons/sunday | SermonList(category=sunday) |
| MidweekSermons.tsx | /sermons/midweek | SermonList(wednesday+friday) |
| SpecialSermons.tsx | /sermons/special | SermonList(category 없는 것) |
| CommunityDepartments.tsx | /community/departments + /:slug | GET /page-groups?groupKey=departments |
| SmallChurch.tsx | /community/small-church | 정적 소개 |
| NewMember.tsx | /community/new-member | 안내 + GET /form-fields → POST /form-submissions |
| Ministry.tsx | /ministry/god-love, /ministry/neighbor-love | groupKey prop, GET /page-groups 재사용 |
| NewsAnnouncements.tsx | /news/announcements | GET /announcements (기존 API) |
| MinistryBoard.tsx | /news/ministry-board | GET /images?publishedOnly=true |

---

## 5. 관리자 페이지 (신규)

**디렉토리:** `client/src/pages/admin/`

| 파일 | URL | 내용 |
|------|-----|------|
| VideoCategories.tsx | /admin/video-categories | CRUD 테이블, isBuiltIn 행은 삭제 버튼 비활성 |
| PageGroups.tsx | /admin/page-groups | groupKey 탭 전환 + CRUD |
| FormConfig.tsx | /admin/form-config | 폼 필드 순서/활성화 설정 |
| FormSubmissions.tsx | /admin/form-submissions | 신청 내역 읽기 전용 테이블 |

---

## 6. 기존 파일 수정

### App.tsx
새 라우트를 `/:churchSlug` **앞에** 추가:

```
/church/about              → ChurchAbout
/church/worship            → ChurchWorship
/church/directions         → ChurchDirections
/sermons/sunday            → SundaySermons
/sermons/midweek           → MidweekSermons
/sermons/special           → SpecialSermons
/community/departments     → CommunityDepartments
/community/departments/:slug → CommunityDepartments
/community/small-church    → SmallChurch
/community/new-member      → NewMember
/ministry/god-love         → Ministry (groupKey="god-love")
/ministry/god-love/:slug   → Ministry (groupKey="god-love")
/ministry/neighbor-love    → Ministry (groupKey="neighbor-love")
/ministry/neighbor-love/:slug → Ministry (groupKey="neighbor-love")
/news/announcements        → NewsAnnouncements
/news/ministry-board       → MinistryBoard

/admin/video-categories    → VideoCategories
/admin/page-groups         → PageGroups
/admin/form-config         → FormConfig
/admin/form-submissions    → FormSubmissions
```

### PublicView.tsx
- 기존 인라인 `<header>` 제거 → `<PublicPageLayout>` 사용

### DashboardLayout.tsx
메뉴 4개 추가:
```
영상 카테고리  /admin/video-categories
소그룹 관리    /admin/page-groups
폼 필드 설정   /admin/form-config
신청 내역      /admin/form-submissions
```

### Videos.tsx (관리자)
- category Select 필드 추가 (video-categories API 연동)
- 목록에 category 배지 표시

---

## 7. 구현 순서

```
[1] mock-data.controller.ts  → category 필터 + 5개 신규 컨트롤러
[2] mock.module.ts           → 신규 컨트롤러 등록
[3] PublicHeader.tsx         → 내비게이션 컴포넌트
[4] PublicPageLayout.tsx     → 공통 레이아웃 wrapper
[5] App.tsx                  → 라우트 추가
[6] PublicView.tsx           → PublicPageLayout 교체
[7] public/ 공개 페이지 13개
[8] admin/ 관리자 페이지 4개
[9] DashboardLayout.tsx      → 메뉴 추가
[10] Videos.tsx              → category 필드 추가
[11] TypeScript 타입 오류 확인
```

---

## 8. 주요 설계 결정

| 항목 | 결정 |
|------|------|
| 라우팅 충돌 | `/church/about` 같은 2-segment 경로는 wouter `/:churchSlug`(1-segment)와 충돌 없음 |
| 페이지 콘텐츠 | 현재는 정적, 향후 site-config/page-groups로 관리자 편집 가능 구조 |
| 설교 필터 | video.category 컬럼으로 sunday/wednesday/friday/기타 분류 |
| 지도 | Kakao Maps 링크 방식 (임베드 URL은 site-config에 저장, 비어있으면 링크로 대체) |
| 신청 폼 | form-fields API로 동적 렌더링, 제출 시 form-submissions POST |
