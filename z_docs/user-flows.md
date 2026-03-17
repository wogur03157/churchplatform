# 사용자 흐름 가이드

## 1. 교회 홈페이지 신청 (일반 사용자)

### 신청 방법
1. `/apply` 페이지 접속
2. Google 계정으로 로그인
3. 교회 정보 입력:
   - **교회명**: 교회 이름 (URL 슬러그 자동 생성)
   - **URL 슬러그**: 홈페이지 주소 (`/교회슬러그` 형태, 소문자+하이픈)
   - **교회 소개** (선택)
   - **연락처 / 이메일** (선택 — 승인 안내 수신용, Google 계정과 달라도 됨)
   - **주소** (선택)
4. "신청하기" 클릭 → `pending` 상태로 등록

> **참고**: 신청 시 입력하는 이메일은 소통/안내 수신 목적입니다.
> Google 로그인 계정과 달라도 되며, 인증하지 않습니다.

### 신청 후
- 슈퍼어드민이 검토 후 승인/거절
- 승인 시 입력한 이메일로 안내 (이메일 발송 기능 연동 후)

---

## 2. 슈퍼어드민 — 교회 승인 및 관리

### 교회 승인
1. `/super-admin` 접속 (`super_admin` 계정 필요)
2. **검토 대기** 탭에서 신청 목록 확인
3. "승인" → 교회 `active` 상태로 전환
   "거절" → 거절 사유 입력 후 처리

### 교회 설정 (승인 후)
1. 교회 목록에서 "설정" 클릭 → `/super-admin/churches/:id`
2. **교회 정보** 확인 (이름, slug, 이메일, 주소 등)
3. **기능 설정**: 교회별 노출 기능 활성화/비활성화
   (공지사항, 이미지, 영상, 플로팅 메시지, 소그룹, 폼 등)
4. **관리자 관리**: 교회 어드민 계정 목록 확인 / 초대 / 제거 / 권한 설정

---

## 3. 슈퍼어드민 — 관리자 초대

### 초대 흐름
1. `/super-admin/churches/:id` → 관리자 카드 우측 **"초대"** 버튼 클릭
2. 관리자로 등록할 **이메일 주소** 입력
   (교회 신청 이메일과 달라도 됩니다)
3. **"초대 링크 생성"** 클릭
4. 생성된 링크(`/admin/invite?token=...`)를 복사해 담당자에게 전달

> - 초대 링크 유효기간: **7일**
> - **1회 사용 후 자동 만료** (재초대 필요 시 동일한 방법으로 다시 생성)
> - 초대받은 사람의 Google 계정이 초대 이메일과 달라도 수락 가능

---

## 4. 관리자 초대 수락 (신규 관리자)

### 수락 방법
1. 슈퍼어드민에게 받은 초대 링크(`/admin/invite?token=...`) 클릭
2. **Google 계정으로 로그인**
3. 교회명과 초대 이메일 확인 후 **"관리자로 참여하기"** 클릭
4. 완료 → 자동으로 `/admin` 관리자 페이지로 이동

> 로그인하지 않은 상태로 링크를 열면 로그인 화면으로 안내됩니다.
> 로그인 후 **같은 링크를 다시 열어서** 수락하세요.

### 수락 시 자동 처리 내용
- `church_admins` 테이블에 해당 교회 ↔ 사용자 연결 추가
- 사용자 역할이 `user`인 경우 `church_admin`으로 자동 업그레이드

---

## 5. 관리자 권한 설정 (슈퍼어드민)

1. `/super-admin/churches/:id` → 관리자 목록 → **"권한 설정"** 클릭
2. 메뉴별 접근 허용/해제 토글
3. **"전체 허용"** / **"전체 해제"** 일괄 처리 가능

허용 가능한 메뉴:
| 카테고리 | 메뉴 |
|----------|------|
| 콘텐츠 | 공지사항, 이미지, 영상, 영상 카테고리 |
| 메시지 | 플로팅 메시지, 팝업 |
| 설정 | 레이아웃 설정, 소그룹 관리, 폼 필드 설정 |
| 데이터 | 신청 내역 조회 |

---

## 6. 개발 환경 — 초기 DB 세팅

### 실행 순서
```bash
# 1. 스키마 생성 (처음 한 번만)
mysql -u churchuser -pchurchpassword churchplatform < z_docs/db-schema.sql

# 2. 시드 데이터 삽입 (교회 + 기본 데이터)
mysql -u churchuser -pchurchpassword churchplatform < z_docs/seed.sql

# 3. Google 로그인 후, 본인 계정을 슈퍼어드민으로 지정
UPDATE users SET role = 'super_admin' WHERE openId = 'YOUR_GOOGLE_OPEN_ID';

# 4. 교회별 어드민 연결은 슈퍼어드민 페이지에서 초대 링크로 처리 (→ todo)
```

### seed.sql 반복 실행 (교회 추가)
- 기존 교회가 있으면 `MAX(id)+1`로 새 교회를 자동 생성
- 여러 교회를 테스트할 때 반복 실행 가능
- slug: `youngshin` → `youngshin-2` → `youngshin-3` ...

### DB 초기화 (처음부터 다시)
```bash
mysql -u churchuser -pchurchpassword churchplatform < z_docs/reset.sql
mysql -u churchuser -pchurchpassword churchplatform < z_docs/db-schema.sql
mysql -u churchuser -pchurchpassword churchplatform < z_docs/seed.sql
```

---

## 7. API 엔드포인트 (개발 참고)

### 초대 관련
| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | `/api/churches/:id/admins/invite` | 초대 링크 생성 | super_admin |
| GET | `/api/invitations/:token` | 토큰 정보 조회 | 없음 (공개) |
| POST | `/api/invitations/:token/accept` | 초대 수락 | 로그인 필요 |

### 교회 관리 (슈퍼어드민)
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/churches` | 전체 교회 목록 |
| POST | `/api/churches/apply` | 교회 신청 |
| POST | `/api/churches/:id/review` | 승인/거절 |
| GET | `/api/churches/:id/admins` | 관리자 목록 |
| DELETE | `/api/churches/:id/admins/:userId` | 관리자 제거 |
| GET/PATCH | `/api/churches/:id/features/:key` | 기능 설정 |
