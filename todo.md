# 관리자 대시보드 프로젝트 TODO

---

## 🔧 진행 중

---

## 📋 백로그

### 🔴 레이아웃 설정 개편 (섹션 → 자유 구성)
> 데이터 모델 재설계 필요, 어드민 UI + 공개 렌더러 모두 영향
- [ ] 데이터 모델 설계 — 고정 sectionType 대신 자유 항목(메뉴 페이지 단위) 구성 방식으로 변경
- [ ] 어드민 캔버스 UI 개편 — 하위 메뉴 항목을 블록으로 추가/제거/정렬
- [ ] 공개 홈 화면 렌더러 개편 — 새 데이터 모델 기반으로 동적 렌더링

### 🔴 메뉴 전체 커스텀 (대메뉴 + 소메뉴 관리자 직접 편집)
> 대공사 — 페이지 구조 정착 후 진행 권장
> 현재: 대메뉴 하드코딩, 소메뉴는 부서/사역만 page_groups DB 연동
- [ ] 메뉴 전용 테이블 설계 (계층구조, 링크 타입, 순서)
- [ ] 기존 page_groups와의 관계 정리
- [ ] 공개 헤더(PublicHeader) 전면 재작성 — 하드코딩 → DB 기반 동적 렌더링
- [ ] 관리자 메뉴 편집 UI (대메뉴/소메뉴 추가·삭제·순서 변경)
- [ ] 기존 정적 페이지(교회소개, 예배안내 등)를 메뉴 시스템에 연결하는 방식 결정

### 🟡 정적 페이지 어드민 연동 (교회소개, 예배안내 등)
> site_config 확장 또는 별도 page_content 테이블
- [ ] 페이지별 콘텐츠 저장 구조 설계
- [ ] 어드민 페이지 콘텐츠 편집 UI 구현 (교회소개, 예배안내, 오시는 길 등)
- [ ] 공개 정적 페이지에서 DB 데이터 렌더링 연동

### 🟡 플로팅 버튼 개편 (기존 플로팅 메시지 대체)
> 기존 floating_messages 테이블/UI 전면 교체
- [ ] 플로팅 버튼 개념 설계 — 문의하기 / 새가족 등록 폼 등 액션 연결
- [ ] 어드민에서 버튼 텍스트, 연결 대상(폼/URL) 설정 UI
- [ ] 공개 페이지 플로팅 버튼 구현 — 모바일 좌하단 고정, 클릭 시 확장

### 🟡 테스트 서버 배포
> DB 서비스 선택이 핵심, 팀원 공유 가능한 환경 필요
- [ ] 무료 원격 DB 서비스 선정 (PlanetScale / Railway / Supabase 등 검토)
- [ ] 서버 배포 환경 설정 (Railway / Render / Fly.io 등 검토)
- [ ] 환경변수 (.env) 배포 환경용 분리
- [ ] 외부 접근 가능한 테스트 URL 공유

### 🟡 교회 관리
- [ ] 교회 직접 등록 폼 (슈퍼어드민 → 바로 active로 생성)
- [ ] 공개 교회 신청 페이지 (pending → 슈퍼어드민 승인 흐름)

### 🟡 관리자 초대 흐름
> 슈퍼어드민이 이메일로 초대 링크 생성 → 초대받은 사람이 Google 로그인으로 수락 → church_admin 자동 등록
- [ ] 슈퍼어드민: 교회 상세 페이지에서 초대 링크 생성 UI
- [ ] 초대 수락 페이지 (`/admin/invite?token=...`) — Google 로그인 후 자동 교회 어드민 등록
- [ ] 서버: invitations 테이블 + 토큰 발급/검증/수락 API
- [ ] 초대 링크 유효기간 7일, 1회 사용 후 만료

### 🟢 신청 페이지 (교회별)
> form_fields 이미 구현됨, 공개 페이지 렌더러만 필요
- [ ] 신청 폼 공개 페이지 구현 (form_fields 기반 동적 렌더링)
- [ ] 폼 제출 → form_submissions 저장 연동
- [ ] 어드민에서 제출 내역 확인

### 🟢 공지사항 상단 고정 (핀 기능)
- [ ] announcements 테이블에 `isPinned` 필드 추가
- [ ] 어드민 공지사항 목록에서 핀 토글 UI
- [ ] 공개 홈/공지사항 목록에서 핀된 항목 상단 고정 표시

### 🟢 공지사항 이미지 첨부
- [ ] 공지사항 엔티티에 이미지 필드 추가 (또는 본문 내 이미지 삽입)
- [ ] 어드민 공지사항 편집 UI에 이미지 업로드 추가
- [ ] 공개 공지사항 상세 페이지에서 이미지 표시

### 🟢 홈 화면 이미지 섹션 표시 설정 커스텀
> 현재 상수로 처리 (`한 줄 4개, 전체 표시`)
- [ ] 레이아웃 설정에서 이미지 섹션 선택 시 "한 줄 최대 개수" / "최대 표시 개수" 설정 UI 추가
- [ ] layout_settings 엔티티에 설정값 저장 (또는 site_config 활용)
- [ ] 공개 홈 화면에서 설정값 읽어 동적으로 grid 열 수 / slice 개수 적용

### 🟢 영상 카테고리 관리 UI 이동
- [ ] 영상 관리 페이지에 카테고리 관리 버튼/모달 추가
- [ ] 사이드바에서 영상 카테고리 메뉴 제거

### 🟢 스토리지 S3 연동
- [ ] S3 연동 (BUILT_IN_FORGE_API_URL / BUILT_IN_FORGE_API_KEY 설정)

---

## 💡 아이디어 / 추후 검토

---

## ✅ 완료

### 인프라 / 환경
- [x] 모노레포 구조 설정 (client + server + shared)
- [x] NestJS + Vite 통합 서버 (포트 4000 단일 서버)
- [x] Mock 모드 / 실 DB 모드 자동 전환 (SKIP_DB, DATABASE_URL)
- [x] 실 DB 연동 (TypeORM + MySQL, 누락 모듈 5개 구현)
- [x] 로컬 파일 업로드 폴백 (`uploads/` 폴더, S3 연동 전)
- [x] DB 스키마 문서화 (`z_docs/db-schema.sql`)
- [x] 시드 데이터 SQL (`z_docs/seed.sql`)

### 인증 / 권한
- [x] Google OAuth 로그인 (authorization code flow)
- [x] JWT 세션 쿠키
- [x] super_admin / church_admin / user 역할 구분
- [x] OWNER_OPEN_ID 기반 슈퍼어드민 자동 지정
- [x] AdminGuard / SuperAdminGuard / OptionalAuthGuard
- [x] Mock 모드 Dev 로그인 (super_admin + church_admin 각각)
- [x] 관리자 권한 설정 (permKey 기반 기능/메뉴 접근 제어)

### 교회 관리
- [x] 교회 엔티티 및 CRUD API
- [x] 슈퍼어드민 대시보드 (교회 목록, 승인/거절)
- [x] 교회 기능 활성화 관리 (church_features)
- [x] 교회 관리자 추가/제거 (church_admins)

### 백엔드 API 모듈
- [x] 공지사항 (announcements)
- [x] 이미지 (images)
- [x] 영상 (videos)
- [x] 플로팅 메시지 (floating-messages)
- [x] 팝업 (popups)
- [x] 레이아웃 설정 (layout-settings)
- [x] 영상 카테고리 (video-categories)
- [x] 소그룹/부서 (page-groups)
- [x] 폼 필드 설정 (form-fields)
- [x] 폼 제출 데이터 (form-submissions)
- [x] 사이트 설정 (site-config)
- [x] AI 어시스턴트 (ai-assistant)
- [x] 스토리지 서비스 (storage)
- [x] 알림 (notifications)

### 관리자 UI
- [x] DashboardLayout (사이드바, 권한별 메뉴 표시)
- [x] 공지사항 관리
- [x] 이미지 관리
- [x] 영상 관리
- [x] 플로팅 메시지 관리
- [x] 팝업 관리
- [x] 레이아웃 설정 (드래그앤드롭 캔버스, colSpan)
- [x] 영상 카테고리 관리
- [x] 소그룹/부서 관리 (page-groups)
- [x] 폼 필드 설정
- [x] 폼 제출 내역 조회
- [x] AI 컨텐츠 작성 지원 UI

### 공개 페이지
- [ ] slug 기반 다교회 라우팅 — `/:churchSlug`에서 slug 읽어 churchId 조회 후 API 필터링 적용 (현재는 slug 미사용, 단일 교회 기준)
- [x] 홈 화면 (레이아웃 설정 연동, 섹션 순서/가시성/colSpan 반영)
- [x] 공개 헤더 (메가 메뉴)
- [x] 교회 소개 / 예배 안내 / 오시는 길
- [x] 설교 영상 (주일/수요/금요/특별)
- [x] 커뮤니티 (부서, 소그룹, 새가족)
- [x] 사역 (하나님사랑, 이웃사랑)
- [x] 소식 (공지사항, 사역부소식)
- [x] 플로팅 메시지 / 팝업
- [x] 홈 화면 디자인 개편 (an 브랜치 — 히어로, 카드, 애니메이션)

### 버그 수정
- [x] TypeORM upsert PrimaryGeneratedColumn 버그 → find+save 패턴 교체 (users, layout-settings)
- [x] Google OAuth 콜백 후 name/email NULL 저장 버그
- [x] 레이아웃 설정 저장 시 레코드 복제 버그
- [x] boolean 상태 필드 → string enum 전환 (isAllowed → status 등)
