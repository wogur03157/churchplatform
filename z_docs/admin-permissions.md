# 관리자 권한 설정 구현 (2026-03-05)

## 개요

슈퍼어드민이 교회별 기능을 제어(기능 설정)하고, 각 관리자별 메뉴 접근을 제어(권한 설정)할 수 있도록 구현.

---

## 기능 설정 vs 권한 설정 역할 구분

| 구분 | 기능 설정 | 권한 설정 |
|------|-----------|-----------|
| 단위 | 교회 | 관리자 개인 |
| 목적 | 교회 홈페이지 노출 여부 + 해당 교회에서 사용 가능한 기능 범위 | 활성화된 기능 내에서 관리자별 접근 범위 |
| 설정 주체 | 슈퍼어드민 | 슈퍼어드민 |
| 적용 대상 | 해당 교회 전체 어드민 | 특정 어드민 개인 |

### 메뉴 표시 규칙

| 조건 | 표시 방식 |
|------|-----------|
| 슈퍼어드민 | 항상 전체 메뉴 정상 표시 |
| 기능 설정 OFF | 잠금 아이콘 + "비활성" 레이블 + 툴팁("슈퍼어드민에 문의하세요") — 클릭 불가 |
| 기능 설정 ON + 권한 미허용 | 완전히 숨김 |
| 기능 설정 ON + 권한 허용 | 정상 표시 |

---

## 권한 키 목록

| permKey | 메뉴 | 기능 설정 포함 |
|---------|------|---------------|
| `announcements` | 공지사항 | ✓ |
| `images` | 이미지 | ✓ |
| `videos` | 영상 | ✓ |
| `video_categories` | 영상 카테고리 | ✓ |
| `floating_messages` | 플로팅 메시지 | ✓ |
| `popups` | 팝업 | ✓ |
| `layout_settings` | 레이아웃 설정 | ✓ |
| `page_groups` | 소그룹 관리 | ✓ |
| `form_config` | 폼 필드 설정 | ✓ |
| `form_submissions` | 신청 내역 | ✓ |
| `ai_assistant` | AI 어시스턴트 | ✓ (기능 설정만, 메뉴 없음) |

> `ai_assistant`는 메뉴 항목은 없고 기능 설정(교회 단위 활성화)만 존재.

---

## 변경 파일

### 서버

#### `server/modules/mock/mock-data.controller.ts`
- `ALL_PERM_KEYS` 상수 추가 (10개 권한 키)
- `ADMIN_PERMISSIONS` 데이터 추가 (박집사 id:3, 전체 허용)
- `getEnabledFeatures(churchId)` 함수 export — auth controller에서 사용
- `MockAdminPermissionsController` 추가
  - `GET /admins?churchId=` — 어드민 목록
  - `GET /admins/:id/permissions` — `{ permissions: string[] }` 반환
  - `PATCH /admins/:id/permissions` — `{ permKey, isAllowed }` 업데이트
- `ALL_FEATURE_KEYS`에 신규 기능 키 추가 (`video_categories`, `popups`, `page_groups`, `form_config`, `form_submissions`, `ai_assistant`)

#### `server/modules/mock/mock-auth.controller.ts`
- `me()` 응답에 `permissions`, `enabledFeatures` 추가
  - `super_admin`: `permissions: null`, `enabledFeatures: null` (전체 허용)
  - `church_admin`: 각각 허용 목록 배열

#### `server/modules/mock/mock.module.ts`
- `MockAdminPermissionsController` 등록

### 클라이언트

#### `client/src/components/DashboardLayout.tsx`
- `menuItems` → `NAV_ITEMS`로 교체, 각 항목에 `permKey` 추가
- `getNavState()` 함수 — `visible` / `locked` / `hidden` 3단계 상태 계산
- `locked` 상태: 자물쇠 아이콘 + "비활성" 레이블 + Tooltip
- `hidden` 상태: 렌더링 제외

#### `client/src/pages/super-admin/ChurchDetail.tsx`
- `PERM_LABELS` → `PERM_GROUPS`로 교체 (콘텐츠 / 메시지 / 설정 / 데이터 4그룹)
- `FEATURE_LABELS`에 누락 항목 추가 및 `ai_assistant` 복원
- `ALL_PERM_KEYS` — 전체 허용/해제 일괄 처리용
- 권한 설정 Sheet UI 개선
  - 관리자 정보 헤더 (아바타 + 이름 + 이메일)
  - 전체 허용 / 전체 해제 버튼 (현재 상태에 따라 disabled)
  - 카테고리별 그룹 렌더링
  - 데이터 로딩 전 스위치 disabled 처리
