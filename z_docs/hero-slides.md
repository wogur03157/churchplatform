# 히어로 배너 (Hero Slides)

## 개요

홈화면 최상단 섹션을 슬라이드 배너로 교체. 관리자가 다양한 타입의 슬라이드를 등록하면
공개 홈에서 Embla Carousel로 자동 순환 표시된다.

---

## 슬라이드 타입 (4종)

| type | 이름 | 설명 |
|------|------|------|
| `text` | 텍스트만 | 그라데이션 배경 + 중앙 텍스트 |
| `image_split` | 좌우분할 | 이미지 왼쪽 50% / 흰 배경 + 텍스트 오른쪽 50% |
| `image_bottom` | 텍스트하단 | 전체 이미지 + 어두운 그라데이션 + 텍스트 하단 고정 |
| `image` | 이미지 | 전체 이미지 + 중앙 텍스트 오버레이 (선택) |

---

## DB 테이블 (`hero_slides`)

```sql
CREATE TABLE `hero_slides` (
  `id`           INT NOT NULL AUTO_INCREMENT,
  `churchId`     INT NULL,
  `type`         ENUM('text','image_split','image_bottom','image') NOT NULL DEFAULT 'text',
  `title`        VARCHAR(255) NULL,
  `subtitle`     VARCHAR(500) NULL,
  `imageUrl`     TEXT NULL,
  `imageKey`     VARCHAR(500) NULL,
  `displayOrder` INT NOT NULL DEFAULT 1,
  `status`       ENUM('visible','hidden') NOT NULL DEFAULT 'visible',
  `createdAt`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_hs_churchId` (`churchId`),
  CONSTRAINT `fk_hs_churchId` FOREIGN KEY (`churchId`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

> **주의**: 컬럼명은 camelCase (TypeORM 기본값). `church_id` 아님.

---

## API 엔드포인트

| Method | 경로 | 가드 | 설명 |
|--------|------|------|------|
| GET | `/api/hero-slides` | OptionalAuthGuard | 공개 (visible만) |
| GET | `/api/hero-slides/all` | AdminGuard | 관리자용 (전체) |
| POST | `/api/hero-slides` | AdminGuard | 슬라이드 생성 |
| PATCH | `/api/hero-slides/:id` | AdminGuard | 수정 |
| DELETE | `/api/hero-slides/:id` | AdminGuard | 삭제 |

---

## 프론트엔드

### 공개 홈 (`client/src/pages/PublicView.tsx`)
- `HeroCarousel` 컴포넌트 (모듈 레벨 정의)
- `useEmblaCarousel({ loop: true })`
- 5초 자동 순환 (`setInterval → emblaApi.scrollNext()`)
- 하단 dot 인디케이터 → 클릭 시 해당 슬라이드로 이동
- 슬라이드 없으면 기본 텍스트 화면 표시

### 관리자 (`client/src/pages/admin/LayoutSettings.tsx`)
- `HeroSlidePanel` — hero 섹션에서 슬라이드 목록 + 등록
- `HeroSlideForm` — **모듈 레벨 정의** (컴포넌트 내부 정의 시 한글 IME 깨짐)
  - 타입 선택 버튼
  - 이미지 업로드 (text 타입 제외)
  - 제목/부제목 입력 (image 타입은 선택)

---

## 서버 모듈 (`server/modules/hero-slides/`)

```
hero-slides/
├── entities/
│   └── hero-slide.entity.ts   HeroSlide 엔티티
├── hero-slides.controller.ts
├── hero-slides.service.ts
└── hero-slides.module.ts
```

---

## 이미지 파일 처리

- 업로드 파일은 `uploads/` 디렉토리에 저장 (`/uploads/{key}` URL)
- `uploads/` 디렉토리는 git 추적 중 (S3 연동 전 임시)
- nginx에서 `/uploads/` 요청을 Node.js로 프록시해야 함:
  ```nginx
  location /uploads/ {
      proxy_pass http://127.0.0.1:4000;
      proxy_http_version 1.1;
      proxy_set_header Host $host;
  }
  ```
