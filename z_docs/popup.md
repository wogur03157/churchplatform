# 팝업 관리

## 개요

홈페이지에 이미지 팝업을 띄우는 기능입니다. 게시기간을 설정하면 해당 기간에만 자동으로 노출되며, 클릭 시 외부 링크로 이동할 수 있습니다.

---

## DB 스키마

```sql
CREATE TABLE popups (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  churchId    INT NULL,                          -- 교회별 팝업 (NULL = 전역)
  title       VARCHAR(255) NOT NULL,             -- 팝업 제목 (관리용)
  imageKey    VARCHAR(512) NULL,                 -- S3 파일 키
  imageUrl    VARCHAR(1024) NULL,                -- 이미지 URL
  linkUrl     VARCHAR(1024) NULL,                -- 클릭 시 이동 링크 (선택)
  startDate   TIMESTAMP NULL,                    -- 게시 시작 (NULL = 즉시)
  endDate     TIMESTAMP NULL,                    -- 게시 종료 (NULL = 무기한)
  isActive    TINYINT(1) DEFAULT 0,              -- 활성화 여부
  createdBy   INT NOT NULL,
  createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## API

| Method | 경로 | 설명 |
|--------|------|------|
| GET | `/api/popups` | 전체 목록 (관리자) |
| GET | `/api/popups?activeOnly=true` | 현재 노출 중인 팝업 (공개) |
| GET | `/api/popups/:id` | 단건 조회 |
| POST | `/api/popups` | 생성 (이미지 base64 업로드 포함) |
| PATCH | `/api/popups/:id` | 수정 |
| DELETE | `/api/popups/:id` | 삭제 |

### activeOnly 필터 조건

```
isActive = 1
AND (startDate IS NULL OR startDate <= NOW())
AND (endDate IS NULL OR endDate >= NOW())
```

### POST /api/popups 요청 바디

```json
{
  "title": "성탄절 예배 안내",
  "linkUrl": "https://example.com",      // 선택
  "startDate": "2025-12-20T00:00",       // 선택 (ISO 형식)
  "endDate": "2025-12-26T23:59",         // 선택
  "isActive": true,
  "fileData": "<base64 인코딩된 이미지>", // 선택
  "mimeType": "image/jpeg"               // fileData 있을 때 필수
}
```

---

## 노출 상태

| 상태 | 조건 |
|------|------|
| 노출 중 | isActive=1, 게시기간 내 |
| 예정 | isActive=1, startDate가 미래 |
| 종료 | isActive=1, endDate가 과거 |
| 비활성 | isActive=0 |

---

## 공개 홈페이지 동작

- 페이지 로드 시 `GET /api/popups?activeOnly=true` 호출
- 활성 팝업이 있으면 전체화면 오버레이 모달로 표시
- 여러 개일 경우 첫 번째 팝업만 표시 (추후 순환 노출 등 확장 가능)
- 닫기 방법: 닫기 버튼 클릭 또는 배경(오버레이) 클릭
- linkUrl이 있으면 이미지 클릭 또는 "자세히 보기" 링크로 이동

---

## 관리자 화면

경로: `/admin/popups`

- 팝업 목록을 카드 그리드로 표시 (썸네일 + 상태 배지)
- 생성/수정 다이얼로그에서 이미지 드래그 업로드(파일 선택) 및 미리보기 제공
- 이미지는 base64로 서버에 전송 → S3 업로드 후 URL 저장

---

## 파일 구조

```
server/modules/popups/
├── entities/popup.entity.ts
├── popups.service.ts
├── popups.controller.ts
└── popups.module.ts

client/src/pages/admin/Popups.tsx
```

---

## 향후 확장 포인트

- 교회별 팝업 (churchId 활용)
- 여러 팝업 순환 노출 (index 상태 관리)
- "오늘 하루 보지 않기" 쿠키/localStorage 처리
- 팝업 클릭수 / 노출수 통계
