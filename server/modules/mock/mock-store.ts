/**
 * 인메모리 mock 데이터 저장소.
 * 모든 가변 데이터 배열을 여기서 관리하여 컨트롤러가 라우팅 로직에만 집중할 수 있게 합니다.
 * 새로운 mock 엔티티를 추가할 때는 이 파일에 정의하세요.
 */

const past = (days: number) => new Date(Date.now() - days * 86_400_000);
const now = new Date();

// ─── Announcements ────────────────────────────────────────────────────────────

export let ANNOUNCEMENTS: any[] = [
  {
    id: 1,
    title: "서비스 오픈 안내",
    content: "<p>안녕하세요! 저희 서비스가 정식 오픈되었습니다.</p><p>많은 이용 부탁드립니다.</p>",
    authorId: 1, churchId: null, status: "published", publishedAt: past(5), createdAt: past(6), updatedAt: past(5),
  },
  {
    id: 2,
    title: "시스템 점검 예정 공지",
    content: "<p>2024년 2월 28일 새벽 2시~4시 시스템 점검이 예정되어 있습니다.</p>",
    authorId: 1, churchId: null, status: "published", publishedAt: past(2), createdAt: past(3), updatedAt: past(2),
  },
  {
    id: 3,
    title: "[초안] 신규 기능 출시 예정",
    content: "<p>곧 새로운 기능이 출시될 예정입니다.</p>",
    authorId: 1, churchId: null, status: "draft", publishedAt: null, createdAt: past(1), updatedAt: past(1),
  },
];

// ─── Images ───────────────────────────────────────────────────────────────────

export let IMAGES: any[] = [
  {
    id: 1, title: "메인 배너", description: "홈 화면 메인 배너 이미지",
    fileKey: "mock/banner.jpg", url: "https://picsum.photos/seed/banner/1200/400",
    mimeType: "image/jpeg", fileSize: 204800, uploadedBy: 1, churchId: null,
    status: "published", displayOrder: 1, createdAt: past(10), updatedAt: past(10),
  },
  {
    id: 2, title: "갤러리 이미지 1", description: null,
    fileKey: "mock/gallery1.jpg", url: "https://picsum.photos/seed/gallery1/800/600",
    mimeType: "image/jpeg", fileSize: 102400, uploadedBy: 1, churchId: null,
    status: "published", displayOrder: 2, createdAt: past(7), updatedAt: past(7),
  },
  {
    id: 3, title: "[비공개] 갤러리 이미지 2", description: null,
    fileKey: "mock/gallery2.jpg", url: "https://picsum.photos/seed/gallery2/800/600",
    mimeType: "image/jpeg", fileSize: 98304, uploadedBy: 1, churchId: null,
    status: "draft", displayOrder: 3, createdAt: past(3), updatedAt: past(3),
  },
];

// ─── Videos ───────────────────────────────────────────────────────────────────

export let VIDEOS: any[] = [
  {
    id: 1, title: "주일예배 설교 — 은혜의 강", description: "주님의 은혜를 나누는 주일예배입니다.",
    videoType: "youtube", fileKey: null, url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    mimeType: null, fileSize: null, duration: 2820,
    churchId: null, uploadedBy: 1, status: "published", displayOrder: 1,
    category: "sunday", createdAt: past(7), updatedAt: past(7),
  },
  {
    id: 2, title: "수요예배 설교 — 믿음의 길", description: "수요예배 말씀 나눔입니다.",
    videoType: "youtube", fileKey: null, url: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
    thumbnailUrl: "https://img.youtube.com/vi/ysz5S6PUM-U/hqdefault.jpg",
    mimeType: null, fileSize: null, duration: 1800,
    churchId: null, uploadedBy: 1, status: "published", displayOrder: 2,
    category: "wednesday", createdAt: past(5), updatedAt: past(5),
  },
  {
    id: 3, title: "금요기도회 말씀", description: "금요기도회 설교입니다.",
    videoType: "youtube", fileKey: null, url: "https://www.youtube.com/watch?v=9bZkp7q19f0",
    thumbnailUrl: "https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg",
    mimeType: null, fileSize: null, duration: 2100,
    churchId: null, uploadedBy: 1, status: "published", displayOrder: 3,
    category: "friday", createdAt: past(3), updatedAt: past(3),
  },
  {
    id: 4, title: "성탄절 특별예배", description: "성탄절을 기념하는 특별예배입니다.",
    videoType: "youtube", fileKey: null, url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    mimeType: null, fileSize: null, duration: 3600,
    churchId: null, uploadedBy: 1, status: "published", displayOrder: 4,
    category: "christmas", createdAt: past(90), updatedAt: past(90),
  },
  {
    id: 5, title: "[초안] 주일설교 준비중", description: "준비 중인 설교입니다.",
    videoType: "youtube", fileKey: null, url: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
    thumbnailUrl: null, mimeType: null, fileSize: null, duration: null,
    churchId: null, uploadedBy: 1, status: "draft", displayOrder: 5,
    category: "sunday", createdAt: past(1), updatedAt: past(1),
  },
];

// ─── Floating Messages ────────────────────────────────────────────────────────

export let FLOATING_MESSAGES: any[] = [
  {
    id: 1, title: "신규 이벤트 진행 중!", content: "지금 가입하면 첫 달 무료!",
    messageType: "announcement", churchId: null, status: "active",
    startDate: past(3), endDate: new Date(Date.now() + 7 * 86_400_000),
    displayPosition: "top", createdBy: 1, createdAt: past(3), updatedAt: past(3),
  },
  {
    id: 2, title: "점검 안내", content: "2024-02-28 새벽 2시~4시 시스템 점검 예정입니다.",
    messageType: "warning", churchId: null, status: "inactive",
    startDate: null, endDate: null,
    displayPosition: "bottom", createdBy: 1, createdAt: past(1), updatedAt: past(1),
  },
];

// ─── Layout Settings ──────────────────────────────────────────────────────────

export let LAYOUT_SETTINGS: any[] = [
  { id: 1, sectionType: "hero",          churchId: null, status: "visible", displayOrder: 1, colSpan: 3, title: "환영합니다", subtitle: "서비스 소개 문구가 여기에 표시됩니다.", imageKey: null, imageUrl: null, updatedBy: 1, updatedAt: now },
  { id: 2, sectionType: "announcements", churchId: null, status: "visible", displayOrder: 2, colSpan: 1, title: "공지사항",   subtitle: null, imageKey: null, imageUrl: null, updatedBy: 1, updatedAt: now },
  { id: 3, sectionType: "images",        churchId: null, status: "visible", displayOrder: 3, colSpan: 1, title: "갤러리",    subtitle: null, imageKey: null, imageUrl: null, updatedBy: 1, updatedAt: now },
  { id: 4, sectionType: "videos",        churchId: null, status: "visible", displayOrder: 4, colSpan: 1, title: "영상",      subtitle: null, imageKey: null, imageUrl: null, updatedBy: 1, updatedAt: now },
  { id: 5, sectionType: "image_a",       churchId: null, status: "hidden",  displayOrder: 5, colSpan: 1, title: null,       subtitle: null, imageKey: null, imageUrl: null, updatedBy: 1, updatedAt: now },
  { id: 6, sectionType: "image_b",       churchId: null, status: "hidden",  displayOrder: 6, colSpan: 1, title: null,       subtitle: null, imageKey: null, imageUrl: null, updatedBy: 1, updatedAt: now },
];

// ─── Popups ───────────────────────────────────────────────────────────────────

export let POPUPS: any[] = [
  {
    id: 1, churchId: null, title: "성탄절 예배 안내",
    imageKey: null, imageUrl: "https://picsum.photos/seed/popup1/800/600", linkUrl: null,
    startDate: past(7), endDate: new Date(Date.now() + 7 * 86_400_000),
    status: "active", createdBy: 1, createdAt: past(7), updatedAt: past(7),
  },
  {
    id: 2, churchId: null, title: "[비활성] 신년 행사 팝업",
    imageKey: null, imageUrl: "https://picsum.photos/seed/popup2/800/600", linkUrl: "https://example.com",
    startDate: null, endDate: null,
    status: "inactive", createdBy: 1, createdAt: past(14), updatedAt: past(14),
  },
];

// ─── Churches ─────────────────────────────────────────────────────────────────

export type ChurchStatus = "pending" | "active" | "suspended" | "rejected";

export let CHURCHES: any[] = [
  {
    id: 1, name: "은혜교회", slug: "grace-church", status: "pending" as ChurchStatus,
    description: "서울 강남에 위치한 은혜교회입니다.", email: "grace@church.kr",
    phone: "02-1234-5678", address: "서울시 강남구 테헤란로 123", logoUrl: null,
    customDomain: null, appliedBy: 2, approvedBy: null, approvedAt: null,
    rejectedReason: null, createdAt: past(3), updatedAt: past(3),
  },
  {
    id: 2, name: "새벽빛교회", slug: "dawn-light", status: "active" as ChurchStatus,
    description: "새벽빛으로 밝히는 교회", email: "dawn@church.kr",
    phone: "031-987-6543", address: "경기도 성남시 분당구 판교로 45", logoUrl: null,
    customDomain: null, appliedBy: 3, approvedBy: 1, approvedAt: past(10),
    rejectedReason: null, createdAt: past(15), updatedAt: past(10),
  },
  {
    id: 3, name: "테스트교회", slug: "test-church", status: "rejected" as ChurchStatus,
    description: null, email: null, phone: null, address: null, logoUrl: null,
    customDomain: null, appliedBy: 4, approvedBy: null, approvedAt: null,
    rejectedReason: "정보가 불충분합니다. 교회 정보를 보완 후 재신청해 주세요.",
    createdAt: past(20), updatedAt: past(18),
  },
];

// ─── Church Features ──────────────────────────────────────────────────────────

export const ALL_FEATURE_KEYS = [
  "announcements", "images", "videos", "video_categories",
  "floating_messages", "popups", "layout_settings",
  "page_groups", "form_config", "form_submissions",
  "ai_assistant",
] as const;

export type FeatureKey = typeof ALL_FEATURE_KEYS[number];

export let FEATURES: any[] = ALL_FEATURE_KEYS.map((key, i) => ({
  id: i + 1, churchId: 2, featureKey: key, status: key === "ai_assistant" ? "disabled" : "enabled",
  updatedBy: null, updatedAt: now,
}));

export const getEnabledFeatures = (churchId: number): string[] =>
  FEATURES.filter((f) => f.churchId === churchId && f.status === "enabled").map((f) => f.featureKey);

// ─── Church Admins ────────────────────────────────────────────────────────────

export const ADMINS: any[] = [
  { id: 3, churchId: 2, name: "박집사", email: "deacon@dawn-light.kr", role: "church_admin" },
];

// ─── Video Categories ─────────────────────────────────────────────────────────

export let VIDEO_CATEGORIES: any[] = [
  { id: 1, name: "주일예배", slug: "sunday",    isBuiltIn: true,  displayOrder: 1, churchId: null },
  { id: 2, name: "수요예배", slug: "wednesday", isBuiltIn: true,  displayOrder: 2, churchId: null },
  { id: 3, name: "금요예배", slug: "friday",    isBuiltIn: true,  displayOrder: 3, churchId: null },
  { id: 4, name: "부활절",   slug: "easter",    isBuiltIn: false, displayOrder: 4, churchId: null },
  { id: 5, name: "성탄절",   slug: "christmas", isBuiltIn: false, displayOrder: 5, churchId: null },
];

// ─── Page Groups ──────────────────────────────────────────────────────────────

export let PAGE_GROUPS: any[] = [
  { id: 1, groupKey: "departments",   name: "유아부",      slug: "infant",           description: "0~36개월 영아 및 유아를 위한 부서입니다.", content: null, imageUrl: "https://picsum.photos/seed/dept1/400/300", displayOrder: 1, status: "visible", churchId: null, createdAt: past(30), updatedAt: past(30) },
  { id: 2, groupKey: "departments",   name: "아동부",      slug: "children",         description: "초등학생을 위한 부서입니다.", content: null, imageUrl: "https://picsum.photos/seed/dept2/400/300", displayOrder: 2, status: "visible", churchId: null, createdAt: past(30), updatedAt: past(30) },
  { id: 3, groupKey: "departments",   name: "청소년부",    slug: "youth",            description: "중고등학생을 위한 부서입니다.", content: null, imageUrl: "https://picsum.photos/seed/dept3/400/300", displayOrder: 3, status: "visible", churchId: null, createdAt: past(30), updatedAt: past(30) },
  { id: 4, groupKey: "departments",   name: "청년부",      slug: "young-adult",      description: "청년들이 함께 모이는 부서입니다.", content: null, imageUrl: "https://picsum.photos/seed/dept4/400/300", displayOrder: 4, status: "visible", churchId: null, createdAt: past(30), updatedAt: past(30) },
  { id: 5, groupKey: "god-love",      name: "새벽기도회",  slug: "dawn-prayer",      description: "매일 새벽 5시 30분 예배당에서 진행됩니다.", content: null, imageUrl: "https://picsum.photos/seed/gl1/400/300", displayOrder: 1, status: "visible", churchId: null, createdAt: past(30), updatedAt: past(30) },
  { id: 6, groupKey: "god-love",      name: "성경공부",    slug: "bible-study",      description: "화요일 오전 10시, 깊은 말씀 공부.", content: null, imageUrl: "https://picsum.photos/seed/gl2/400/300", displayOrder: 2, status: "visible", churchId: null, createdAt: past(30), updatedAt: past(30) },
  { id: 7, groupKey: "god-love",      name: "구역예배",    slug: "cell-group",       description: "각 구역별로 모여 드리는 예배입니다.", content: null, imageUrl: "https://picsum.photos/seed/gl3/400/300", displayOrder: 3, status: "visible", churchId: null, createdAt: past(30), updatedAt: past(30) },
  { id: 8, groupKey: "neighbor-love", name: "지역사회봉사", slug: "community-service", description: "우리 지역사회를 섬기는 봉사활동.", content: null, imageUrl: "https://picsum.photos/seed/nl1/400/300", displayOrder: 1, status: "visible", churchId: null, createdAt: past(30), updatedAt: past(30) },
  { id: 9, groupKey: "neighbor-love", name: "푸드뱅크",    slug: "food-bank",        description: "어려운 이웃에게 식품을 나눕니다.", content: null, imageUrl: "https://picsum.photos/seed/nl2/400/300", displayOrder: 2, status: "visible", churchId: null, createdAt: past(30), updatedAt: past(30) },
];

// ─── Form Fields ──────────────────────────────────────────────────────────────

export let FORM_FIELDS: any[] = [
  { id: 1, fieldType: "text",     label: "이름",     placeholder: "성함을 입력하세요",   required: true,  options: null,                                    allowOther: "none", displayOrder: 1, churchId: null, status: "active" },
  { id: 2, fieldType: "number",   label: "연락처",   placeholder: "010-0000-0000",     required: true,  options: null,                                    allowOther: "none", displayOrder: 2, churchId: null, status: "active" },
  { id: 3, fieldType: "dropdown", label: "방문목적", placeholder: "선택해주세요",       required: true,  options: ["예배 참석", "상담 요청", "친구 소개"], allowOther: "text", displayOrder: 3, churchId: null, status: "active" },
  { id: 4, fieldType: "textarea", label: "메시지",   placeholder: "전달하실 내용 입력", required: false, options: null,                                    allowOther: "none", displayOrder: 4, churchId: null, status: "inactive" },
];

// ─── Form Submissions ─────────────────────────────────────────────────────────

export let FORM_SUBMISSIONS: any[] = [
  { id: 1, fieldData: { "이름": "홍길동", "연락처": "010-1234-5678", "방문목적": "예배 참석" }, submittedAt: past(3), churchId: null },
  { id: 2, fieldData: { "이름": "김영희", "연락처": "010-9876-5432", "방문목적": "상담 요청" }, submittedAt: past(1), churchId: null },
];

// ─── Admin Permissions ────────────────────────────────────────────────────────

export const ALL_PERM_KEYS = [
  "announcements", "images", "videos", "video_categories",
  "floating_messages", "popups", "layout_settings",
  "page_groups", "form_config", "form_submissions",
] as const;

export let ADMIN_PERMISSIONS: { adminId: number; permKey: string; status: "allowed" | "denied" }[] = [
  ...ALL_PERM_KEYS.map((k) => ({ adminId: 3, permKey: k, status: "allowed" as const })),
];

// ─── Site Config ──────────────────────────────────────────────────────────────

export let SITE_CONFIG: any[] = [
  { id: 1, churchId: null, key: "church_name",   value: "영신교회",                         description: "교회 이름" },
  { id: 2, churchId: null, key: "map_address",   value: "서울특별시 양천구 목동로 19길 28", description: "교회 주소" },
  { id: 3, churchId: null, key: "map_embed_url", value: "",                                 description: "카카오맵 임베드 URL (비어있으면 링크로 대체)" },
];
