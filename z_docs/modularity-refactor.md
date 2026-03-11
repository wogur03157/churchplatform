# 모듈화·확장성 리팩터링 (2026-03-11)

## 배경

두 명이 함께 개발하는 구조에서 새 기능을 추가할 때마다 동일한 코드를 복붙해야 하는 문제가 있었습니다.
이번 작업은 그 반복 패턴을 공통화하고, 책임 단위를 명확히 분리하는 데 초점을 맞췄습니다.

---

## 변경 파일 목록

| 파일 | 구분 | 내용 |
|------|------|------|
| `shared/entities.ts` | 신규 | 엔티티 인터페이스 정의 |
| `shared/types.ts` | 수정 | entities 재export 추가 |
| `client/src/lib/video-utils.ts` | 신규 | 영상 임베드 URL 유틸 |
| `client/src/hooks/useCRUD.ts` | 신규 | CRUD 공통 훅 |
| `client/src/pages/admin/Videos.tsx` | 수정 | useCRUD·video-utils·타입 적용 |
| `client/src/pages/public/SermonList.tsx` | 수정 | video-utils·Video 타입 적용 |
| `client/src/pages/public/MidweekSermons.tsx` | 수정 | video-utils·Video 타입 적용 |
| `server/modules/mock/mock-store.ts` | 신규 | mock 데이터 분리 |
| `server/modules/mock/mock-data.controller.ts` | 수정 | mock-store import, CRUD 일관성 개선 |
| `server/main.ts` | 수정 | 기본 포트 3000 → 4000 |
| `server/vite.ts` | 수정 | Node 18 crypto.hash 폴리필 (이전 커밋) |

---

## 1. 공유 엔티티 타입 (`shared/entities.ts`)

### 문제
클라이언트 전역에서 `any`로 타입을 처리하고 있어 자동완성이 안 되고 실수가 잡히지 않았습니다.

### 해결
`shared/entities.ts`에 엔티티 인터페이스를 정의하고 `shared/types.ts`에서 재export합니다.

```ts
// 클라이언트에서 사용 예
import type { Video, Announcement, PageGroup } from "@shared/entities";
```

### 정의된 인터페이스
`Video`, `VideoCategory`, `Announcement`, `Image`, `Popup`, `FloatingMessage`,
`LayoutSetting`, `PageGroup`, `Church`, `ChurchFeature`, `FormField`, `FormSubmission`, `SiteConfig`

### 새 엔티티 추가 방법
`shared/entities.ts`에 인터페이스를 추가하면 클라이언트·서버 양쪽에서 즉시 사용 가능합니다.

---

## 2. 영상 임베드 유틸 (`client/src/lib/video-utils.ts`)

### 문제
`getEmbedUrl()` / `getVideoEmbed()` 함수가 세 곳에 복붙되어 있었습니다.
- `client/src/pages/admin/Videos.tsx`
- `client/src/pages/public/SermonList.tsx`
- `client/src/pages/public/MidweekSermons.tsx`

### 해결
`getVideoEmbedUrl(video: VideoLike): string | null`으로 통합했습니다.

```ts
import { getVideoEmbedUrl } from "@/lib/video-utils";

const embedUrl = getVideoEmbedUrl(video); // YouTube·Vimeo 지원, null = 임베드 불가
```

### 지원 포맷
- YouTube: `youtube.com/watch?v=`, `youtu.be/` 단축 링크
- Vimeo: `vimeo.com/{id}`
- 그 외: `null` 반환

---

## 3. CRUD 공통 훅 (`client/src/hooks/useCRUD.ts`)

### 문제
어드민 페이지마다 동일한 패턴이 반복되었습니다.

```ts
// 모든 어드민 페이지에 복붙된 코드 (~75줄)
const createMutation = useMutation({
  mutationFn: (data) => api.post("/videos", data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["videos"] });
    toast.success("영상이 등록되었습니다");
    resetForm();
    setIsCreateOpen(false);
  },
  onError: (err) => toast.error(`오류: ${err.message}`),
});
// updateMutation, deleteMutation도 동일한 패턴...
```

### 해결
`useCRUD()` 훅으로 공통화했습니다.

```ts
const { createMutation, updateMutation, confirmDelete } = useCRUD({
  queryKey: "videos",   // React Query 캐시 키
  path: "videos",       // API 경로 (/videos, /videos/:id)
  entityName: "영상",   // 토스트 메시지용
  onSuccess: () => { resetForm(); setDialogOpen(false); },
});

// 사용
createMutation.mutate({ title, url, ... });
updateMutation.mutate({ id, title, url, ... });
confirmDelete(video.id); // confirm() 포함
```

### 현재 적용 범위
- `Videos.tsx` ← 적용 완료 (참고 패턴)
- 나머지 어드민 페이지 적용 여부는 별도 결정 예정

---

## 4. Mock 데이터 분리 (`server/modules/mock/mock-store.ts`)

### 문제
`mock-data.controller.ts` 한 파일에 데이터 배열 + 컨트롤러 로직이 혼재해 811줄에 달했습니다.
두 명이 동시에 수정할 때 충돌이 자주 발생했습니다.

### 해결
데이터와 로직을 파일로 분리했습니다.

```
server/modules/mock/
├── mock-store.ts          ← 모든 mock 데이터 배열 (여기만 수정)
├── mock-data.controller.ts ← 라우팅·비즈니스 로직만 (mock-store에서 import)
├── mock-auth.controller.ts
└── mock.module.ts
```

### mock 데이터 수정 방법
`mock-store.ts`만 열면 됩니다. 컨트롤러를 건드릴 필요가 없습니다.

### 새 mock 엔티티 추가 방법
1. `mock-store.ts`에 데이터 배열 추가 (`export let NEW_ENTITY`)
2. `mock-data.controller.ts`에 `@Controller` 클래스 추가
3. `mock.module.ts`의 `controllers` 배열에 등록

---

## 5. 기본 포트 변경

| 항목 | 이전 | 이후 |
|------|------|------|
| 개발 서버 포트 | 3000 | **4000** |
| 환경변수 오버라이드 | `PORT=3000` | `PORT=4000` |

`PORT` 환경변수로 변경 가능합니다. 포트가 사용 중이면 4001~4019 범위에서 자동 탐색합니다.

---

## 코드 규칙 (두 명이 공유)

### 새 어드민 CRUD 페이지 추가 시

1. **타입**: `shared/entities.ts`에 인터페이스 추가
2. **API**: `api.get<MyEntity[]>("/my-resource")` 형태로 타입 명시
3. **뮤테이션**: `useCRUD({ queryKey, path, entityName, onSuccess })` 사용
4. **폼 상태**: 개별 `useState` 남발 대신 객체로 묶기 (`Videos.tsx`의 `VideoForm` 참고)

### 영상 관련 기능 추가 시

- 임베드 URL 생성은 반드시 `getVideoEmbedUrl()`을 사용
- 새 플랫폼 지원이 필요하면 `video-utils.ts` 한 곳만 수정

### mock 데이터 수정 시

- `mock-store.ts`만 수정
- 컨트롤러 로직 변경이 필요한 경우에만 `mock-data.controller.ts` 수정
