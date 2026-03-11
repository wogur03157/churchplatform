# 상태 Enum 리팩터링 (2026-03-11)

## 배경

엔티티의 boolean 필드(`isPublished: 0 | 1`, `isActive: 0 | 1` 등)를 의미있는 string 상태값으로 전환했습니다.

### 변경 이유

- `isPublished === 1` 보다 `status === "published"` 가 의도가 명확함
- 나중에 중간 상태 추가가 자연스러움 — `"draft" | "published" | "archived"` 처럼 값만 추가
- 반면 `0 | 1` boolean은 확장 시 마이그레이션 필요
- DB도 `TINYINT(1)` 대신 `ENUM`으로 바꾸면 스키마 자체가 자기 문서화됨

### boolean 유지 기준

순수 yes/no 속성으로 확장 여지가 없는 필드는 `boolean` 유지:
- `required` (FormField) — 필수 여부, 중간값 없음
- `isBuiltIn` (VideoCategory) — 시스템 내장 여부, 속성값

---

## 필드 변환 매핑

| 엔티티 | 이전 | 이후 |
|--------|------|------|
| `Announcement`, `Image`, `Video` | `isPublished: 0 \| 1` | `status: "published" \| "draft"` |
| `FloatingMessage`, `Popup`, `FormField` | `isActive: 0 \| 1` | `status: "active" \| "inactive"` |
| `PageGroup`, `LayoutSetting` | `isVisible: 0 \| 1` | `status: "visible" \| "hidden"` |
| `ChurchFeature` | `isEnabled: 0 \| 1` | `status: "enabled" \| "disabled"` |
| `FormField` | `allowOther: boolean` | `allowOther: "text" \| "none"` |

`allowOther`는 나중에 허용 입력 형식이 다양해질 수 있어 enum으로 전환.
예) `"none" \| "text" \| "textarea" \| "number"`

---

## 변경 파일 목록

| 파일 | 내용 |
|------|------|
| `shared/entities.ts` | 필드 타입 변경 + 누락 필드 추가 |
| `server/modules/mock/mock-store.ts` | 데이터값 string으로 변환 |
| `server/modules/mock/mock-data.controller.ts` | 필터·비교 로직 수정 |
| `client/src/pages/admin/Announcements.tsx` | `status` 상태로 교체 |
| `client/src/pages/admin/Images.tsx` | `status` 상태로 교체 |
| `client/src/pages/admin/Videos.tsx` | `status` 상태로 교체 |
| `client/src/pages/admin/FloatingMessages.tsx` | `status` 상태로 교체 |
| `client/src/pages/admin/Popups.tsx` | `status` 상태로 교체 |
| `client/src/pages/admin/PageGroups.tsx` | `status` 상태로 교체 |
| `client/src/pages/admin/FormConfig.tsx` | `status` 상태로 교체 |
| `client/src/pages/admin/LayoutSettings.tsx` | `status` 상태로 교체 |
| `client/src/pages/super-admin/ChurchDetail.tsx` | `status` 비교 수정 |
| `client/src/pages/PublicView.tsx` | `status === "visible"` 필터 수정 |
| `client/src/components/PreviewPanel.tsx` | 동일 |
| `client/src/components/PublicHeader.tsx` | 동일 |
| `z_docs/db-schema.sql` | TINYINT(1) → ENUM |

---

## 이번에 함께 수정한 누락 필드 (`shared/entities.ts`)

| 항목 | 내용 |
|------|------|
| `churchId: number \| null` 추가 | `Announcement`, `Image`, `FloatingMessage`, `LayoutSetting`, `VideoCategory`, `FormField`, `SiteConfig` |
| `FloatingMessage.messageType` | `"success"` 추가 |
| `FormFieldType` | `"radio"` 추가 |
| `PageGroup` | `createdAt`, `updatedAt` 추가 |
| `ChurchFeature` | `updatedBy`, `updatedAt` 추가 |
| `SiteConfig.description` | `string` → `string \| null` |

---

## 코드 패턴

### Switch 연결

```tsx
// isPublished (Announcement, Image, Video)
<Switch
  checked={status === "published"}
  onCheckedChange={(v) => setStatus(v ? "published" : "draft")}
/>

// isActive (FloatingMessage, Popup)
<Switch
  checked={status === "active"}
  onCheckedChange={(v) => setStatus(v ? "active" : "inactive")}
/>

// isVisible (PageGroup)
<Switch
  checked={form.status === "visible"}
  onCheckedChange={(v) => setForm({ ...form, status: v ? "visible" : "hidden" })}
/>
```

### 상태 비교

```tsx
// 공개 여부 확인
announcement.status === "published"

// 활성 여부 확인
message.status === "active"

// 숨김 여부 확인
group.status === "hidden"
```

### 새 상태값 추가 시

1. `shared/entities.ts` 타입에 값 추가
   예) `status: "published" | "draft" | "archived"`
2. `z_docs/db-schema.sql` ENUM 정의에도 추가
3. 해당 필드를 비교하는 클라이언트·서버 코드에서 새 케이스 처리

---

## DB 스키마 변경 요약

```sql
-- 이전
`isPublished` TINYINT(1) NOT NULL DEFAULT 0

-- 이후
`status` ENUM('published','draft') NOT NULL DEFAULT 'draft'
```

실 DB 연동 시 `ALTER TABLE` 또는 마이그레이션 스크립트로 반영 필요.
