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
    status: "published", displayOrder: 1, showOnHome: true, createdAt: past(10), updatedAt: past(10),
  },
  {
    id: 2, title: "갤러리 이미지 1", description: null,
    fileKey: "mock/gallery1.jpg", url: "https://picsum.photos/seed/gallery1/800/600",
    mimeType: "image/jpeg", fileSize: 102400, uploadedBy: 1, churchId: null,
    status: "published", displayOrder: 2, showOnHome: true, createdAt: past(7), updatedAt: past(7),
  },
  {
    id: 3, title: "[비공개] 갤러리 이미지 2", description: null,
    fileKey: "mock/gallery2.jpg", url: "https://picsum.photos/seed/gallery2/800/600",
    mimeType: "image/jpeg", fileSize: 98304, uploadedBy: 1, churchId: null,
    status: "draft", displayOrder: 3, showOnHome: false, createdAt: past(3), updatedAt: past(3),
  },
];

// ─── Videos ───────────────────────────────────────────────────────────────────

export let VIDEOS: any[] = [
  {
    id: 1, title: "주일예배 설교 — 은혜의 강", description: "주님의 은혜를 나누는 주일예배입니다.",
    scripture: "요한복음 4:14", sermonDate: "2026-06-08",
    videoType: "youtube", fileKey: null, url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    mimeType: null, fileSize: null, duration: 2820,
    churchId: null, uploadedBy: 1, status: "published", displayOrder: 1,
    category: "sunday", createdAt: past(7), updatedAt: past(7),
  },
  {
    id: 2, title: "수요예배 설교 — 믿음의 길", description: "수요예배 말씀 나눔입니다.",
    scripture: "히브리서 11:1", sermonDate: "2026-06-04",
    videoType: "youtube", fileKey: null, url: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
    thumbnailUrl: "https://img.youtube.com/vi/ysz5S6PUM-U/hqdefault.jpg",
    mimeType: null, fileSize: null, duration: 1800,
    churchId: null, uploadedBy: 1, status: "published", displayOrder: 2,
    category: "wednesday", createdAt: past(5), updatedAt: past(5),
  },
  {
    id: 3, title: "금요기도회 말씀", description: "금요기도회 설교입니다.",
    scripture: "시편 46:1", sermonDate: "2026-06-06",
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
    messageType: "announcement", churchId: null, status: "inactive",
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
  { id: 3, sectionType: "images",        churchId: null, status: "visible", displayOrder: 3, colSpan: 1, title: "갤러리",    subtitle: null, imageKey: null, imageUrl: null, gridCols: 4, updatedBy: 1, updatedAt: now },
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
    status: "inactive", // 디자인 기준: 기본 노출 없음 createdBy: 1, createdAt: past(7), updatedAt: past(7),
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
  { id: 1, formType: "new-member", fieldType: "text",     label: "이름",       placeholder: "성함을 입력하세요",    required: true,  options: null,                                           allowOther: "none", displayOrder: 1, churchId: null, status: "active" },
  { id: 2, formType: "new-member", fieldType: "number",   label: "연락처",     placeholder: "010-0000-0000",      required: true,  options: null,                                           allowOther: "none", displayOrder: 2, churchId: null, status: "active" },
  { id: 3, formType: "new-member", fieldType: "dropdown", label: "방문 경로",  placeholder: "선택해주세요",        required: false, options: ["지인 소개", "인터넷 검색", "지나치다 발견", "기타"], allowOther: "none", displayOrder: 3, churchId: null, status: "active" },
  { id: 4, formType: "new-member", fieldType: "dropdown", label: "예배 참석",  placeholder: "희망 예배를 선택하세요", required: false, options: ["1부 (09:00)", "2부 (11:00)", "청년부 (14:00)"],    allowOther: "none", displayOrder: 4, churchId: null, status: "active" },
  { id: 5, formType: "new-member", fieldType: "textarea", label: "전하고 싶은 말", placeholder: "궁금한 점이나 전하고 싶은 말씀을 자유롭게 적어주세요 (선택)", required: false, options: null, allowOther: "none", displayOrder: 5, churchId: null, status: "active" },
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

// ─── Invitations ──────────────────────────────────────────────────────────────

export let INVITATIONS: { id: number; churchId: number; email: string; token: string; expiresAt: Date; usedAt: Date | null; createdAt: Date }[] = [];

// ─── Hero Slides ──────────────────────────────────────────────────────────────

export let HERO_SLIDES: any[] = [
  {
    id: 1, churchId: null, type: "image",
    subtitle: "",
    title: "예수께서 이르시되 내가 곧\n길이요 진리요 생명이니\n나로 말미암지 않고는\n아버지께로 올 자가 없느니라",
    description: "요한복음 14장 6절",
    primaryButtonText: "처음 오셨나요?",
    primaryButtonLink: "/community/new-member",
    secondaryButtonText: "우리가 믿는 예수님은?",
    secondaryButtonLink: "/jesus",
    imageUrl: "/images/night.png",
    imageKey: null, displayOrder: 1, status: "visible", createdAt: past(10), updatedAt: past(10),
  },
  {
    id: 2, churchId: null, type: "image",
    subtitle: "WORSHIP & PRAISE",
    title: "예배의 감격이 살아있고\n찬양이 넘치는 교회",
    description: "신령과 진정으로 드리는 예배를 통해 하나님의 살아 계심과 하늘의 큰 평안을 누립니다.",
    primaryButtonText: "예배 시간 안내",
    primaryButtonLink: "#예배안내",
    secondaryButtonText: "지난 설교 보기",
    secondaryButtonLink: "#설교말씀",
    imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=2671&auto=format&fit=crop",
    imageKey: null, displayOrder: 2, status: "visible", createdAt: past(10), updatedAt: past(10),
  },
  {
    id: 3, churchId: null, type: "image",
    subtitle: "NEXT GENERATION",
    title: "믿음의 다음세대를\n사랑으로 세워가는 교회",
    description: "어린이부터 청소년, 귀한 청년들까지 하나님의 꿈과 비전 속에서 아름답게 동역하며 기쁨으로 자라납니다.",
    primaryButtonText: "다음세대 부서 소개",
    primaryButtonLink: "#다음세대",
    secondaryButtonText: "청년 공동체 보기",
    secondaryButtonLink: "#nextgen/3",
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2670&auto=format&fit=crop",
    imageKey: null, displayOrder: 3, status: "visible", createdAt: past(10), updatedAt: past(10),
  },
];

// ─── Site Config ──────────────────────────────────────────────────────────────

export let SITE_CONFIG: any[] = [
  { id: 1, churchId: null, key: "church_name",    value: "영신교회",                         description: "교회 이름" },
  { id: 2, churchId: null, key: "map_address",    value: "서울특별시 양천구 목동로 19길 28", description: "교회 주소" },
  { id: 3, churchId: null, key: "map_embed_url",  value: "",                                 description: "카카오맵 임베드 URL (비어있으면 링크로 대체)" },
  { id: 4, churchId: null, key: "church_logo_url",value: "",                                 description: "교회 로고 이미지 URL" },
  { id: 5, churchId: null, key: "hero_icon_1_url",value: "",                                 description: "홈 퀵메뉴 아이콘 1 (예배 안내)" },
  { id: 6, churchId: null, key: "hero_icon_2_url",value: "",                                 description: "홈 퀵메뉴 아이콘 2 (오시는 길)" },
  { id: 7, churchId: null, key: "hero_icon_3_url",value: "",                                 description: "홈 퀵메뉴 아이콘 3 (새가족 안내)" },
  { id: 8, churchId: null, key: "hero_icon_4_url",value: "",                                 description: "홈 퀵메뉴 아이콘 4 (온라인 예배)" },
];

// ─── Home Ministry Items ──────────────────────────────────────────────────────

export let HOME_MINISTRY_ITEMS: any[] = [
  {
    id: 1, churchId: null, title: "행복한대학", displayOrder: 1, status: "active",
    description: "배움과 웃음이 가득한 시니어들을 위한 선교 공동체입니다.",
    imageUrl: "https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?q=80&w=800&auto=format&fit=crop",
    imageKey: null, createdAt: past(10), updatedAt: past(10),
  },
  {
    id: 2, churchId: null, title: "뮤직아카데미", displayOrder: 2, status: "active",
    description: "음악을 통해 재능을 나누며 영혼의 치유와 성장을 이룹니다.",
    imageUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=800&auto=format&fit=crop",
    imageKey: null, createdAt: past(10), updatedAt: past(10),
  },
  {
    id: 3, churchId: null, title: "사랑나눔박스", displayOrder: 3, status: "active",
    description: "지역 사회와 이웃들에게 따뜻한 전도의 사랑과 도움을 전합니다.",
    imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop",
    imageKey: null, createdAt: past(10), updatedAt: past(10),
  },
];

// ─── Home Next Gen Items ──────────────────────────────────────────────────────

export let HOME_NEXT_GEN_ITEMS: any[] = [
  {
    id: 1, churchId: null, title: "유아부", subtitle: "Yes Kids of Grace",
    targetAge: "4세 ~ 7세 유아", worshipTime: "주일 오전 11:00", location: "본당 1층 영아실",
    description: "하나님의 예쁜 꼬마들이 생애 첫 예배와 신앙 공동체 속에서 아름다운 배움과 기쁨을 누리는 사랑스런 모임입니다.",
    imageUrl: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=800&auto=format&fit=crop",
    imageKey: null, displayOrder: 1, status: "active",
    motto: "마땅히 행할 길을 아이에게 가르치라 그리하면 늙어도 그것을 떠나지 아니하리라 (잠언 22:6)",
    scheduleJson: [
      { time: "10:30 ~ 10:50", activity: "영접 및 찬양 율동", detail: "신나는 찬양과 율동으로 예수님의 마음을 열어요" },
      { time: "10:50 ~ 11:15", activity: "말씀 선포 및 예배", detail: "그림성경과 동화를 활용하여 쉽게 하나님의 말씀을 배워요" },
      { time: "11:15 ~ 11:45", activity: "분반 성경 공부 및 크래프트 활동", detail: "오늘 전해진 말씀을 다양한 오감 공작 활동으로 기억해요" },
      { time: "11:45 ~ 12:00", activity: "기도와 간식 나눔", detail: "다정하게 선생님, 친구들과 주님의 사랑을 나눠요" },
    ],
    calendarJson: [
      { month: "2월", title: "겨울 유아 성경학교", desc: "온 가족이 함께하는 일일 성경체험 캠프" },
      { month: "5월", title: "어린이날 페스티벌", desc: "꿈 가득 야외 포토존 및 선물 가득 풍성한 패밀리 데이" },
      { month: "7월", title: "여름 유아 성경학교", desc: "워터 슬라이드와 오감 말씀 풍덩 놀이 캠프" },
      { month: "12월", title: "성탄 축하 발표회", desc: "귀여운 찬양 율동 피날레로 예수님을 축하해요" },
    ],
    staffInfo: "김미래 전도사 | 강사랑 부장집사 | 8명의 사랑 충만한 교사진",
    createdAt: past(10), updatedAt: past(10),
  },
  {
    id: 2, churchId: null, title: "초등부", subtitle: "Yes Disciples of Jesus",
    targetAge: "초등 1학년 ~ 6학년", worshipTime: "주일 오전 11:00", location: "교육관 2층 초등부실",
    description: "예수님의 빛나는 성품과 풍성한 사랑을 닮으며, 말씀 묵상과 즐거운 전례, 찬양을 통해 주님의 제자로 성장합니다.",
    imageUrl: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=800&auto=format&fit=crop",
    imageKey: null, displayOrder: 2, status: "active",
    motto: "예수는 지혜와 키가 자라가며 하나님과 사람에게 더욱 사랑스러워 가시더라 (누가복음 2:52)",
    scheduleJson: [],
    calendarJson: [],
    staffInfo: "이한림 강도사 | 박정성 장로 | 12명의 열정적인 멘토 교사진",
    createdAt: past(10), updatedAt: past(10),
  },
  {
    id: 3, churchId: null, title: "중고등부 (SFC)", subtitle: "Yes Dreamers of Praise",
    targetAge: "중·고등학생 (14~19세)", worshipTime: "주일 오전 11:00", location: "교육관 3층 예드림홀",
    description: "인생의 가장 찬란하고 감성 가득한 사춘기 시절에 찬양과 사랑을 나누며 하나님 안에서 깊은 비전과 소명을 발견합니다.",
    imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=800&auto=format&fit=crop",
    imageKey: null, displayOrder: 3, status: "active",
    motto: "네 창조주를 기억하라 (전도서 12:1)",
    scheduleJson: [],
    calendarJson: [],
    staffInfo: "최하늘 전도사 | 안다정 부장안수집사 | 6명의 젊고 친근한 멘토 교사 공동체",
    createdAt: past(10), updatedAt: past(10),
  },
  {
    id: 4, churchId: null, title: "대학청년부", subtitle: "Yes Lights of Grace",
    targetAge: "20세 이상 싱글 청년", worshipTime: "주일 오후 02:30", location: "본당 2층 글로리홀",
    description: "학업과 청년 실업 등 다양한 고민과 일정을 마주한 세대들이 뜨거운 예배와 따스한 소통의 교제를 빌어 삶의 가치를 세웁니다.",
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop",
    imageKey: null, displayOrder: 4, status: "active",
    motto: "청년이 무엇으로 그의 행실을 깨끗하게 하리이까 (시편 119:9)",
    scheduleJson: [],
    calendarJson: [],
    staffInfo: "홍목양 목사 | 김하람 회장 외 대학청년부 리더단 및 셀 리더 일동",
    createdAt: past(10), updatedAt: past(10),
  },
];

// ─── Home Canaan ──────────────────────────────────────────────────────────────

export let HOME_CANAAN: any[] = [
  {
    id: 1, churchId: null,
    backgroundImageUrl: "https://images.unsplash.com/photo-1498758536662-35b82cd15e29?q=80&w=1200&auto=format&fit=crop",
    backgroundImageKey: null,
    title: "언제나 찾아오셔도 좋습니다. 당신의 영혼이 잠시 머물 수 있는 곳이기를.",
    description: "신앙이 고민될 때, 혹은 제도적 교회에 지쳤을 때 부담 없이 오셔서 차 한 잔 마시며 책을 읽거나 조용히 기도의 시간을 가질 수 있는 열린 공간입니다.",
    button1Text: "Digital Prayer Room",
    button1Link: "#prayer",
    button2Text: "Open Conversation",
    button2Link: "/canaan/online-consultation",
    createdAt: past(10), updatedAt: past(10),
  },
];

// ─── Home Worship Schedule ────────────────────────────────────────────────────

export let HOME_WORSHIP_SCHEDULE: any[] = [
  { id: 1, churchId: null, name: "주일 1부 예배", time: "09:30", location: "본당 2층", displayOrder: 1, status: "active", createdAt: past(10), updatedAt: past(10) },
  { id: 2, churchId: null, name: "주일 2부 예배", time: "11:30", location: "본당 2층", displayOrder: 2, status: "active", createdAt: past(10), updatedAt: past(10) },
  { id: 3, churchId: null, name: "주일 청년부 예배", time: "14:30", location: "본당 2층", displayOrder: 3, status: "active", createdAt: past(10), updatedAt: past(10) },
  { id: 4, churchId: null, name: "수요 성경 대학", time: "19:30", location: "본당 2층", displayOrder: 4, status: "active", createdAt: past(10), updatedAt: past(10) },
  { id: 5, churchId: null, name: "금요 기도회", time: "20:30", location: "본당 2층", displayOrder: 5, status: "active", createdAt: past(10), updatedAt: past(10) },
];

// Content pages mock data
export let CONTENT_CATEGORIES: any[] = [
  // 교회소개
  { id: 1,  churchId: null, parentId: null, name: "교회소개",    slug: "church",        depth: 1, sortOrder: 1, status: "active", createdAt: past(20), updatedAt: past(20) },
  { id: 2,  churchId: null, parentId: 1,    name: "교회 소개",   slug: "about",         depth: 2, sortOrder: 1, status: "active", createdAt: past(20), updatedAt: past(20) },
  { id: 3,  churchId: null, parentId: 1,    name: "예배 안내",   slug: "worship",       depth: 2, sortOrder: 2, status: "active", createdAt: past(20), updatedAt: past(20) },
  { id: 4,  churchId: null, parentId: 1,    name: "오시는 길",   slug: "directions",    depth: 2, sortOrder: 3, status: "active", createdAt: past(20), updatedAt: past(20) },
  // 설교
  { id: 5,  churchId: null, parentId: null, name: "설교",        slug: "sermons",       depth: 1, sortOrder: 2, status: "active", createdAt: past(20), updatedAt: past(20) },
  { id: 6,  churchId: null, parentId: 5,    name: "주일설교",    slug: "sunday",        depth: 2, sortOrder: 1, status: "active", createdAt: past(20), updatedAt: past(20) },
  { id: 7,  churchId: null, parentId: 5,    name: "수요/금요",   slug: "midweek",       depth: 2, sortOrder: 2, status: "active", createdAt: past(20), updatedAt: past(20) },
  { id: 8,  churchId: null, parentId: 5,    name: "특별설교",    slug: "special",       depth: 2, sortOrder: 3, status: "active", createdAt: past(20), updatedAt: past(20) },
  // 공동체
  { id: 9,  churchId: null, parentId: null, name: "공동체",      slug: "community",     depth: 1, sortOrder: 3, status: "active", createdAt: past(20), updatedAt: past(20) },
  { id: 10, churchId: null, parentId: 9,    name: "부서 소개",   slug: "departments",   depth: 2, sortOrder: 1, status: "active", createdAt: past(20), updatedAt: past(20) },
  { id: 11, churchId: null, parentId: 9,    name: "작은교회",    slug: "small-church",  depth: 2, sortOrder: 2, status: "active", createdAt: past(20), updatedAt: past(20) },
  { id: 12, churchId: null, parentId: 9,    name: "새가족 안내", slug: "new-member",    depth: 2, sortOrder: 3, status: "active", createdAt: past(20), updatedAt: past(20) },
  // 사역
  { id: 13, churchId: null, parentId: null, name: "사역",        slug: "ministry",      depth: 1, sortOrder: 4, status: "active", createdAt: past(20), updatedAt: past(20) },
  { id: 14, churchId: null, parentId: 13,   name: "하나님사랑",  slug: "god-love",      depth: 2, sortOrder: 1, status: "active", createdAt: past(20), updatedAt: past(20) },
  { id: 15, churchId: null, parentId: 13,   name: "이웃사랑",    slug: "neighbor-love", depth: 2, sortOrder: 2, status: "active", createdAt: past(20), updatedAt: past(20) },
  // 소식
  { id: 16, churchId: null, parentId: null, name: "소식",        slug: "news",          depth: 1, sortOrder: 5, status: "active", createdAt: past(20), updatedAt: past(20) },
  { id: 17, churchId: null, parentId: 16,   name: "공지사항",    slug: "announcements", depth: 2, sortOrder: 1, status: "active", createdAt: past(20), updatedAt: past(20) },
  { id: 18, churchId: null, parentId: 16,   name: "사역게시판",  slug: "ministry-board",depth: 2, sortOrder: 2, status: "active", createdAt: past(20), updatedAt: past(20) },
];

export let CONTENT_PAGES: any[] = [
  { id: 1, categoryId: 2, churchId: null, templateCode: "content", title: "��ȸ �Ұ�", content: "<h2>��ȸ �Ұ�</h2><p>���ű�ȸ�� ����� ����, �Ʒ��� ���� �Բ� �����ϴ� ����ü�Դϴ�.</p><h2>����</h2><p>�ϳ��� ����� �̿� ����� ���� �翪���� �����մϴ�.</p>", status: "published", createdAt: past(18), updatedAt: past(18) },
  { id: 2, categoryId: 3, churchId: null, templateCode: "hero", title: "���� �ȳ�", content: "<h2>���� ����</h2><p>1�� 09:00, 2�� 11:00</p><h2>���� ����</h2><p>������ 19:30, �ݿ��� 19:30</p>", status: "published", createdAt: past(18), updatedAt: past(18) },
  { id: 3, categoryId: 4, churchId: null, templateCode: "content", title: "���ô� ��", content: "<h2>�ּ�</h2><p>����Ư���� ��õ�� �񵿷� 19�� 28</p><p>īī���ʰ� ���̹������� ���� ã�� �� �ֽ��ϴ�.</p>", status: "published", createdAt: past(18), updatedAt: past(18) },
];

export let CONTENT_PAGE_MEDIA: any[] = [
  { id: 1, pageId: 1, slotKey: "side_img", mediaType: "image", url: "https://picsum.photos/seed/church-about/1200/800", thumbnailUrl: null, altText: "��ȸ �Ұ�", sortOrder: 1, createdAt: past(18), updatedAt: past(18) },
  { id: 2, pageId: 2, slotKey: "hero", mediaType: "image", url: "https://picsum.photos/seed/church-worship/1400/700", thumbnailUrl: null, altText: "���� �ȳ�", sortOrder: 1, createdAt: past(18), updatedAt: past(18) },
];
