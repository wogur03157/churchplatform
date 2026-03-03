import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from "@nestjs/common";

// ─── Mock Data ──────────────────────────────────────────────────────────────

const now = new Date();
const past = (days: number) => new Date(Date.now() - days * 86400_000);

const ANNOUNCEMENTS = [
  {
    id: 1,
    title: "서비스 오픈 안내",
    content: "<p>안녕하세요! 저희 서비스가 정식 오픈되었습니다.</p><p>많은 이용 부탁드립니다.</p>",
    authorId: 1,
    isPublished: 1,
    publishedAt: past(5),
    createdAt: past(6),
    updatedAt: past(5),
  },
  {
    id: 2,
    title: "시스템 점검 예정 공지",
    content: "<p>2024년 2월 28일 새벽 2시~4시 시스템 점검이 예정되어 있습니다.</p><p>이용에 불편을 드려 죄송합니다.</p>",
    authorId: 1,
    isPublished: 1,
    publishedAt: past(2),
    createdAt: past(3),
    updatedAt: past(2),
  },
  {
    id: 3,
    title: "[초안] 신규 기능 출시 예정",
    content: "<p>곧 새로운 기능이 출시될 예정입니다.</p>",
    authorId: 1,
    isPublished: 0,
    publishedAt: null,
    createdAt: past(1),
    updatedAt: past(1),
  },
];

const IMAGES = [
  {
    id: 1,
    title: "메인 배너",
    description: "홈 화면 메인 배너 이미지",
    fileKey: "mock/banner.jpg",
    url: "https://picsum.photos/seed/banner/1200/400",
    mimeType: "image/jpeg",
    fileSize: 204800,
    uploadedBy: 1,
    isPublished: 1,
    displayOrder: 1,
    createdAt: past(10),
    updatedAt: past(10),
  },
  {
    id: 2,
    title: "갤러리 이미지 1",
    description: null,
    fileKey: "mock/gallery1.jpg",
    url: "https://picsum.photos/seed/gallery1/800/600",
    mimeType: "image/jpeg",
    fileSize: 102400,
    uploadedBy: 1,
    isPublished: 1,
    displayOrder: 2,
    createdAt: past(7),
    updatedAt: past(7),
  },
  {
    id: 3,
    title: "[비공개] 갤러리 이미지 2",
    description: null,
    fileKey: "mock/gallery2.jpg",
    url: "https://picsum.photos/seed/gallery2/800/600",
    mimeType: "image/jpeg",
    fileSize: 98304,
    uploadedBy: 1,
    isPublished: 0,
    displayOrder: 3,
    createdAt: past(3),
    updatedAt: past(3),
  },
];

let VIDEOS: any[] = [
  {
    id: 1, title: "주일예배 설교 — 은혜의 강", description: "주님의 은혜를 나누는 주일예배입니다.",
    videoType: "youtube", fileKey: null,
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    mimeType: null, fileSize: null, duration: 2820,
    churchId: null, uploadedBy: 1, isPublished: 1, displayOrder: 1,
    category: "sunday", createdAt: past(7), updatedAt: past(7),
  },
  {
    id: 2, title: "수요예배 설교 — 믿음의 길", description: "수요예배 말씀 나눔입니다.",
    videoType: "youtube", fileKey: null,
    url: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
    thumbnailUrl: "https://img.youtube.com/vi/ysz5S6PUM-U/hqdefault.jpg",
    mimeType: null, fileSize: null, duration: 1800,
    churchId: null, uploadedBy: 1, isPublished: 1, displayOrder: 2,
    category: "wednesday", createdAt: past(5), updatedAt: past(5),
  },
  {
    id: 3, title: "금요기도회 말씀", description: "금요기도회 설교입니다.",
    videoType: "youtube", fileKey: null,
    url: "https://www.youtube.com/watch?v=9bZkp7q19f0",
    thumbnailUrl: "https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg",
    mimeType: null, fileSize: null, duration: 2100,
    churchId: null, uploadedBy: 1, isPublished: 1, displayOrder: 3,
    category: "friday", createdAt: past(3), updatedAt: past(3),
  },
  {
    id: 4, title: "성탄절 특별예배", description: "성탄절을 기념하는 특별예배입니다.",
    videoType: "youtube", fileKey: null,
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    mimeType: null, fileSize: null, duration: 3600,
    churchId: null, uploadedBy: 1, isPublished: 1, displayOrder: 4,
    category: "christmas", createdAt: past(90), updatedAt: past(90),
  },
  {
    id: 5, title: "[초안] 주일설교 준비중", description: "준비 중인 설교입니다.",
    videoType: "youtube", fileKey: null,
    url: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
    thumbnailUrl: null, mimeType: null, fileSize: null, duration: null,
    churchId: null, uploadedBy: 1, isPublished: 0, displayOrder: 5,
    category: "sunday", createdAt: past(1), updatedAt: past(1),
  },
];

const FLOATING_MESSAGES = [
  {
    id: 1,
    title: "신규 이벤트 진행 중!",
    content: "지금 가입하면 첫 달 무료! 자세한 내용은 공지사항을 확인하세요.",
    messageType: "announcement",
    isActive: 1,
    startDate: past(3),
    endDate: new Date(Date.now() + 7 * 86400_000),
    displayPosition: "top",
    createdBy: 1,
    createdAt: past(3),
    updatedAt: past(3),
  },
  {
    id: 2,
    title: "점검 안내",
    content: "2024-02-28 새벽 2시~4시 시스템 점검 예정입니다.",
    messageType: "warning",
    isActive: 0,
    startDate: null,
    endDate: null,
    displayPosition: "bottom",
    createdBy: 1,
    createdAt: past(1),
    updatedAt: past(1),
  },
];

let LAYOUT_SETTINGS = [
  { id: 1, sectionType: "hero",          isVisible: 1, displayOrder: 1, colSpan: 3, title: "환영합니다", subtitle: "서비스 소개 문구가 여기에 표시됩니다.", imageKey: null, imageUrl: null, updatedBy: 1, updatedAt: now },
  { id: 2, sectionType: "announcements", isVisible: 1, displayOrder: 2, colSpan: 1, title: "공지사항",   subtitle: null, imageKey: null, imageUrl: null, updatedBy: 1, updatedAt: now },
  { id: 3, sectionType: "images",        isVisible: 1, displayOrder: 3, colSpan: 1, title: "갤러리",    subtitle: null, imageKey: null, imageUrl: null, updatedBy: 1, updatedAt: now },
  { id: 4, sectionType: "videos",        isVisible: 1, displayOrder: 4, colSpan: 1, title: "영상",      subtitle: null, imageKey: null, imageUrl: null, updatedBy: 1, updatedAt: now },
  { id: 5, sectionType: "image_a",       isVisible: 0, displayOrder: 5, colSpan: 1, title: null,       subtitle: null, imageKey: null, imageUrl: null, updatedBy: 1, updatedAt: now },
  { id: 6, sectionType: "image_b",       isVisible: 0, displayOrder: 6, colSpan: 1, title: null,       subtitle: null, imageKey: null, imageUrl: null, updatedBy: 1, updatedAt: now },
];

// ─── Controllers ─────────────────────────────────────────────────────────────

@Controller("announcements")
export class MockAnnouncementsController {
  @Get()
  findAll() { return ANNOUNCEMENTS; }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return ANNOUNCEMENTS.find((a) => a.id === Number(id)) ?? null;
  }

  @Post()
  create() { return { ...ANNOUNCEMENTS[0], id: 99, title: "[Mock] 새 공지사항", createdAt: new Date(), updatedAt: new Date() }; }

  @Patch(":id")
  update(@Param("id") id: string) { return ANNOUNCEMENTS.find((a) => a.id === Number(id)) ?? null; }

  @Delete(":id")
  remove() { return { success: true }; }
}

@Controller("images")
export class MockImagesController {
  @Get()
  findAll() { return IMAGES; }

  @Get(":id")
  findOne(@Param("id") id: string) { return IMAGES.find((i) => i.id === Number(id)) ?? null; }

  @Post()
  create() { return { ...IMAGES[0], id: 99, title: "[Mock] 새 이미지", createdAt: new Date(), updatedAt: new Date() }; }

  @Patch(":id")
  update(@Param("id") id: string) { return IMAGES.find((i) => i.id === Number(id)) ?? null; }

  @Delete(":id")
  remove() { return { success: true }; }
}

@Controller("videos")
export class MockVideosController {
  @Get()
  findAll(
    @Query("category") category?: string,
    @Query("publishedOnly") publishedOnly?: string,
  ) {
    let result = [...VIDEOS];
    if (publishedOnly === "true") result = result.filter((v) => v.isPublished === 1);
    if (category) {
      if (category === "special") {
        result = result.filter((v) => !["sunday", "wednesday", "friday"].includes(v.category));
      } else {
        result = result.filter((v) => v.category === category);
      }
    }
    return result;
  }

  @Get(":id")
  findOne(@Param("id") id: string) { return VIDEOS.find((v) => v.id === Number(id)) ?? null; }

  @Post()
  create(@Body() body: any) {
    const newVideo = {
      ...VIDEOS[0], id: VIDEOS.length + 10,
      title: body.title ?? "[Mock] 새 영상",
      category: body.category ?? null,
      isPublished: body.isPublished ? 1 : 0,
      createdAt: new Date(), updatedAt: new Date(),
    };
    VIDEOS = [...VIDEOS, newVideo];
    return { success: true, id: newVideo.id };
  }

  @Post("upload-file")
  uploadFile() { return { success: true, message: "Mock mode: file upload skipped" }; }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: any) {
    VIDEOS = VIDEOS.map((v) => v.id === Number(id) ? { ...v, ...body, updatedAt: new Date() } : v);
    return VIDEOS.find((v) => v.id === Number(id)) ?? null;
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    VIDEOS = VIDEOS.filter((v) => v.id !== Number(id));
    return { success: true };
  }
}

@Controller("floating-messages")
export class MockFloatingMessagesController {
  @Get()
  findAll() { return FLOATING_MESSAGES; }

  @Get(":id")
  findOne(@Param("id") id: string) { return FLOATING_MESSAGES.find((m) => m.id === Number(id)) ?? null; }

  @Post()
  create() { return { ...FLOATING_MESSAGES[0], id: 99, title: "[Mock] 새 메시지", createdAt: new Date(), updatedAt: new Date() }; }

  @Patch(":id")
  update(@Param("id") id: string) { return FLOATING_MESSAGES.find((m) => m.id === Number(id)) ?? null; }

  @Delete(":id")
  remove() { return { success: true }; }
}

@Controller("layout-settings")
export class MockLayoutSettingsController {
  @Get()
  findAll() { return LAYOUT_SETTINGS; }

  @Post("save-all")
  saveAll(@Body() body: any[]) {
    if (Array.isArray(body)) {
      LAYOUT_SETTINGS = LAYOUT_SETTINGS.map((s) => {
        const incoming = body.find((b) => b.sectionType === s.sectionType);
        if (!incoming) return s;
        return {
          ...s,
          isVisible: incoming.isVisible ? 1 : 0,
          displayOrder: incoming.displayOrder ?? s.displayOrder,
          colSpan: incoming.colSpan ?? s.colSpan,
          title: incoming.title ?? s.title,
          subtitle: incoming.subtitle ?? s.subtitle,
          imageKey: incoming.imageKey !== undefined ? incoming.imageKey : s.imageKey,
          imageUrl: incoming.imageUrl !== undefined ? incoming.imageUrl : s.imageUrl,
          updatedAt: new Date(),
        };
      });
    }
    return { success: true };
  }

  @Post("upsert")
  upsert(@Body() body: any) {
    const idx = LAYOUT_SETTINGS.findIndex((s) => s.sectionType === body.sectionType);
    if (idx !== -1) {
      LAYOUT_SETTINGS[idx] = { ...LAYOUT_SETTINGS[idx], ...body, updatedAt: new Date() };
    }
    return LAYOUT_SETTINGS[idx] ?? null;
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: any) {
    const idx = LAYOUT_SETTINGS.findIndex((s) => s.id === Number(id));
    if (idx !== -1) LAYOUT_SETTINGS[idx] = { ...LAYOUT_SETTINGS[idx], ...body, updatedAt: new Date() };
    return LAYOUT_SETTINGS[idx] ?? null;
  }
}

@Controller("ai-assistant")
export class MockAiAssistantController {
  @Post("improve-text")
  improveText() {
    return { result: "[Mock] AI 어시스턴트는 DB 연결 후 사용 가능합니다." };
  }
}

// ─── Mock Popups ──────────────────────────────────────────────────────────────

interface MockPopup {
  id: number; churchId: number | null; title: string;
  imageKey: string | null; imageUrl: string | null; linkUrl: string | null;
  startDate: Date | null; endDate: Date | null; isActive: number;
  createdBy: number; createdAt: Date; updatedAt: Date;
}

let POPUPS: MockPopup[] = [
  {
    id: 1, churchId: null, title: "성탄절 예배 안내",
    imageKey: null,
    imageUrl: "https://picsum.photos/seed/popup1/800/600",
    linkUrl: null,
    startDate: past(7), endDate: new Date(Date.now() + 7 * 86400_000),
    isActive: 1, createdBy: 1, createdAt: past(7), updatedAt: past(7),
  },
  {
    id: 2, churchId: null, title: "[비활성] 신년 행사 팝업",
    imageKey: null,
    imageUrl: "https://picsum.photos/seed/popup2/800/600",
    linkUrl: "https://example.com",
    startDate: null, endDate: null,
    isActive: 0, createdBy: 1, createdAt: past(14), updatedAt: past(14),
  },
];

@Controller("popups")
export class MockPopupsController {
  @Get()
  findAll(@Query("activeOnly") activeOnly?: string) {
    if (activeOnly === "true") {
      const now = new Date();
      return POPUPS.filter(
        (p) => p.isActive === 1
          && (p.startDate === null || p.startDate <= now)
          && (p.endDate === null || p.endDate >= now),
      );
    }
    return POPUPS;
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return POPUPS.find((p) => p.id === Number(id)) ?? null;
  }

  @Post()
  create(@Body() body: any) {
    const popup: MockPopup = {
      id: POPUPS.length + 10,
      churchId: null,
      title: body.title ?? "[Mock] 새 팝업",
      imageKey: null,
      imageUrl: body.imageUrl ?? "https://picsum.photos/seed/new/800/600",
      linkUrl: body.linkUrl ?? null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      isActive: body.isActive ? 1 : 0,
      createdBy: 1, createdAt: new Date(), updatedAt: new Date(),
    };
    POPUPS = [...POPUPS, popup];
    return { success: true, id: popup.id, imageUrl: popup.imageUrl };
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: any) {
    POPUPS = POPUPS.map((p) =>
      p.id === Number(id) ? {
        ...p,
        ...(body.title !== undefined && { title: body.title }),
        ...(body.linkUrl !== undefined && { linkUrl: body.linkUrl || null }),
        ...(body.startDate !== undefined && { startDate: body.startDate ? new Date(body.startDate) : null }),
        ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
        ...(body.isActive !== undefined && { isActive: body.isActive ? 1 : 0 }),
        updatedAt: new Date(),
      } : p,
    );
    return { success: true };
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    POPUPS = POPUPS.filter((p) => p.id !== Number(id));
    return { success: true };
  }
}

// ─── Mock Churches ────────────────────────────────────────────────────────────

type ChurchStatus = "pending" | "active" | "suspended" | "rejected";

interface MockChurch {
  id: number; name: string; slug: string; status: ChurchStatus;
  description: string | null; email: string | null; phone: string | null;
  address: string | null; logoUrl: string | null; customDomain: string | null;
  appliedBy: number; approvedBy: number | null; approvedAt: Date | null;
  rejectedReason: string | null; createdAt: Date; updatedAt: Date;
}

// 메모리 내에서 상태 변경이 반영되도록 let으로 선언
let CHURCHES: MockChurch[] = [
  {
    id: 1, name: "은혜교회", slug: "grace-church", status: "pending",
    description: "서울 강남에 위치한 은혜교회입니다.", email: "grace@church.kr",
    phone: "02-1234-5678", address: "서울시 강남구 테헤란로 123", logoUrl: null,
    customDomain: null, appliedBy: 2, approvedBy: null, approvedAt: null,
    rejectedReason: null, createdAt: past(3), updatedAt: past(3),
  },
  {
    id: 2, name: "새벽빛교회", slug: "dawn-light", status: "active",
    description: "새벽빛으로 밝히는 교회", email: "dawn@church.kr",
    phone: "031-987-6543", address: "경기도 성남시 분당구 판교로 45", logoUrl: null,
    customDomain: null, appliedBy: 3, approvedBy: 1, approvedAt: past(10),
    rejectedReason: null, createdAt: past(15), updatedAt: past(10),
  },
  {
    id: 3, name: "테스트교회", slug: "test-church", status: "rejected",
    description: null, email: null, phone: null, address: null, logoUrl: null,
    customDomain: null, appliedBy: 4, approvedBy: null, approvedAt: null,
    rejectedReason: "정보가 불충분합니다. 교회 정보를 보완 후 재신청해 주세요.",
    createdAt: past(20), updatedAt: past(18),
  },
];

const ALL_FEATURE_KEYS = ["announcements", "images", "videos", "floating_messages", "layout_settings", "ai_assistant"] as const;

interface MockFeature { id: number; churchId: number; featureKey: string; isEnabled: number; }

let FEATURES: MockFeature[] = ALL_FEATURE_KEYS.map((key, i) => ({
  id: i + 1, churchId: 2, featureKey: key, isEnabled: key === "ai_assistant" ? 0 : 1,
}));

const ADMINS = [
  { id: 3, churchId: 2, name: "박집사", email: "deacon@dawn-light.kr", role: "church_admin" },
];

@Controller("churches")
export class MockChurchesController {
  // slug/:slug 와 my/* 는 반드시 :id 라우트보다 먼저 선언해야 함

  @Get("slug/:slug")
  findBySlug(@Param("slug") slug: string) {
    return CHURCHES.find((c) => c.slug === slug) ?? null;
  }

  @Get("my")
  myChurches() {
    // dev 모드에서는 2번 교회를 담당하는 것으로 처리
    return CHURCHES.filter((c) => c.id === 2);
  }

  @Get("my/features")
  myFeatures() {
    return FEATURES.filter((f) => f.churchId === 2);
  }

  @Get()
  findAll() {
    return CHURCHES;
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return CHURCHES.find((c) => c.id === Number(id)) ?? null;
  }

  @Post("apply")
  apply(@Body() body: any) {
    const newChurch: MockChurch = {
      id: CHURCHES.length + 10,
      name: body.name ?? "[Mock] 신규 교회",
      slug: body.slug ?? "new-church",
      status: "pending",
      description: body.description ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      address: body.address ?? null,
      logoUrl: null, customDomain: null,
      appliedBy: 1, approvedBy: null, approvedAt: null, rejectedReason: null,
      createdAt: new Date(), updatedAt: new Date(),
    };
    CHURCHES = [...CHURCHES, newChurch];
    return newChurch;
  }

  @Post(":id/review")
  @HttpCode(200)
  review(@Param("id") id: string, @Body() body: { action: "active" | "rejected"; rejectedReason?: string }) {
    CHURCHES = CHURCHES.map((c) =>
      c.id === Number(id)
        ? { ...c, status: body.action, rejectedReason: body.rejectedReason ?? null,
            approvedBy: body.action === "active" ? 1 : null,
            approvedAt: body.action === "active" ? new Date() : null,
            updatedAt: new Date() }
        : c,
    );
    return CHURCHES.find((c) => c.id === Number(id)) ?? null;
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: any) {
    CHURCHES = CHURCHES.map((c) =>
      c.id === Number(id) ? { ...c, ...body, updatedAt: new Date() } : c,
    );
    return CHURCHES.find((c) => c.id === Number(id)) ?? null;
  }

  @Get(":id/features")
  getFeatures(@Param("id") id: string) {
    const churchId = Number(id);
    const existing = FEATURES.filter((f) => f.churchId === churchId);
    if (existing.length === 0) {
      // 처음 조회 시 기본 피처 세트 생성
      const newFeatures: MockFeature[] = ALL_FEATURE_KEYS.map((key, i) => ({
        id: FEATURES.length + i + 1, churchId, featureKey: key, isEnabled: 1,
      }));
      FEATURES = [...FEATURES, ...newFeatures];
      return newFeatures;
    }
    return existing;
  }

  @Patch(":id/features/:featureKey")
  setFeature(
    @Param("id") id: string,
    @Param("featureKey") featureKey: string,
    @Body("isEnabled") isEnabled: boolean,
  ) {
    const churchId = Number(id);
    const exists = FEATURES.some((f) => f.churchId === churchId && f.featureKey === featureKey);
    if (exists) {
      FEATURES = FEATURES.map((f) =>
        f.churchId === churchId && f.featureKey === featureKey
          ? { ...f, isEnabled: isEnabled ? 1 : 0 }
          : f,
      );
    } else {
      FEATURES = [...FEATURES, { id: FEATURES.length + 1, churchId, featureKey, isEnabled: isEnabled ? 1 : 0 }];
    }
    return FEATURES.find((f) => f.churchId === churchId && f.featureKey === featureKey);
  }

  @Get(":id/admins")
  getAdmins(@Param("id") id: string) {
    return ADMINS.filter((a) => a.churchId === Number(id));
  }

  @Delete(":id/admins/:userId")
  removeAdmin(@Param("id") id: string, @Param("userId") userId: string) {
    const idx = ADMINS.findIndex((a) => a.churchId === Number(id) && a.id === Number(userId));
    if (idx !== -1) ADMINS.splice(idx, 1);
    return { success: true };
  }
}

// ─── Video Categories ─────────────────────────────────────────────────────────

let VIDEO_CATEGORIES: any[] = [
  { id: 1, name: "주일예배", slug: "sunday",    isBuiltIn: true,  displayOrder: 1 },
  { id: 2, name: "수요예배", slug: "wednesday", isBuiltIn: true,  displayOrder: 2 },
  { id: 3, name: "금요예배", slug: "friday",    isBuiltIn: true,  displayOrder: 3 },
  { id: 4, name: "부활절",   slug: "easter",    isBuiltIn: false, displayOrder: 4 },
  { id: 5, name: "성탄절",   slug: "christmas", isBuiltIn: false, displayOrder: 5 },
];

@Controller("video-categories")
export class MockVideoCategoriesController {
  @Get()
  findAll() { return VIDEO_CATEGORIES; }

  @Post()
  create(@Body() body: any) {
    const item = { id: VIDEO_CATEGORIES.length + 10, name: body.name, slug: body.slug, isBuiltIn: false, displayOrder: body.displayOrder ?? 99 };
    VIDEO_CATEGORIES = [...VIDEO_CATEGORIES, item];
    return item;
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: any) {
    VIDEO_CATEGORIES = VIDEO_CATEGORIES.map((c) => c.id === Number(id) ? { ...c, ...body } : c);
    return VIDEO_CATEGORIES.find((c) => c.id === Number(id)) ?? null;
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    const item = VIDEO_CATEGORIES.find((c) => c.id === Number(id));
    if (item?.isBuiltIn) return { success: false, message: "기본 카테고리는 삭제할 수 없습니다." };
    VIDEO_CATEGORIES = VIDEO_CATEGORIES.filter((c) => c.id !== Number(id));
    return { success: true };
  }
}

// ─── Page Groups ──────────────────────────────────────────────────────────────

let PAGE_GROUPS: any[] = [
  { id: 1, groupKey: "departments", name: "유아부",   slug: "infant",         description: "0~36개월 영아 및 유아를 위한 부서입니다.", content: null, imageUrl: "https://picsum.photos/seed/dept1/400/300", displayOrder: 1, isVisible: 1, churchId: null },
  { id: 2, groupKey: "departments", name: "아동부",   slug: "children",       description: "초등학생을 위한 부서입니다.", content: null, imageUrl: "https://picsum.photos/seed/dept2/400/300", displayOrder: 2, isVisible: 1, churchId: null },
  { id: 3, groupKey: "departments", name: "청소년부", slug: "youth",          description: "중고등학생을 위한 부서입니다.", content: null, imageUrl: "https://picsum.photos/seed/dept3/400/300", displayOrder: 3, isVisible: 1, churchId: null },
  { id: 4, groupKey: "departments", name: "청년부",   slug: "young-adult",    description: "청년들이 함께 모이는 부서입니다.", content: null, imageUrl: "https://picsum.photos/seed/dept4/400/300", displayOrder: 4, isVisible: 1, churchId: null },
  { id: 5, groupKey: "god-love",    name: "새벽기도회", slug: "dawn-prayer",  description: "매일 새벽 5시 30분 예배당에서 진행됩니다.", content: null, imageUrl: "https://picsum.photos/seed/gl1/400/300", displayOrder: 1, isVisible: 1, churchId: null },
  { id: 6, groupKey: "god-love",    name: "성경공부",  slug: "bible-study",   description: "화요일 오전 10시, 깊은 말씀 공부.", content: null, imageUrl: "https://picsum.photos/seed/gl2/400/300", displayOrder: 2, isVisible: 1, churchId: null },
  { id: 7, groupKey: "god-love",    name: "구역예배",  slug: "cell-group",    description: "각 구역별로 모여 드리는 예배입니다.", content: null, imageUrl: "https://picsum.photos/seed/gl3/400/300", displayOrder: 3, isVisible: 1, churchId: null },
  { id: 8, groupKey: "neighbor-love", name: "지역사회봉사", slug: "community-service", description: "우리 지역사회를 섬기는 봉사활동.", content: null, imageUrl: "https://picsum.photos/seed/nl1/400/300", displayOrder: 1, isVisible: 1, churchId: null },
  { id: 9, groupKey: "neighbor-love", name: "푸드뱅크",    slug: "food-bank",        description: "어려운 이웃에게 식품을 나눕니다.", content: null, imageUrl: "https://picsum.photos/seed/nl2/400/300", displayOrder: 2, isVisible: 1, churchId: null },
];

@Controller("page-groups")
export class MockPageGroupsController {
  @Get()
  findAll(@Query("groupKey") groupKey?: string) {
    let result = [...PAGE_GROUPS];
    if (groupKey) result = result.filter((g) => g.groupKey === groupKey);
    return result.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  @Get(":id")
  findOne(@Param("id") id: string) { return PAGE_GROUPS.find((g) => g.id === Number(id)) ?? null; }

  @Get("by-slug/:groupKey/:slug")
  findBySlug(@Param("groupKey") groupKey: string, @Param("slug") slug: string) {
    return PAGE_GROUPS.find((g) => g.groupKey === groupKey && g.slug === slug) ?? null;
  }

  @Post()
  create(@Body() body: any) {
    const item = { id: PAGE_GROUPS.length + 10, ...body, createdAt: new Date(), updatedAt: new Date() };
    PAGE_GROUPS = [...PAGE_GROUPS, item];
    return item;
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: any) {
    PAGE_GROUPS = PAGE_GROUPS.map((g) => g.id === Number(id) ? { ...g, ...body, updatedAt: new Date() } : g);
    return PAGE_GROUPS.find((g) => g.id === Number(id)) ?? null;
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    PAGE_GROUPS = PAGE_GROUPS.filter((g) => g.id !== Number(id));
    return { success: true };
  }
}

// ─── Form Fields ──────────────────────────────────────────────────────────────

let FORM_FIELDS: any[] = [
  { id: 1, fieldType: "text",     label: "이름",     placeholder: "성함을 입력하세요",   required: true,  options: null,                                    allowOther: false, displayOrder: 1, isActive: true },
  { id: 2, fieldType: "number",   label: "연락처",   placeholder: "010-0000-0000",     required: true,  options: null,                                    allowOther: false, displayOrder: 2, isActive: true },
  { id: 3, fieldType: "dropdown", label: "방문목적", placeholder: "선택해주세요",       required: true,  options: ["예배 참석", "상담 요청", "친구 소개"], allowOther: true,  displayOrder: 3, isActive: true },
  { id: 4, fieldType: "textarea", label: "메시지",   placeholder: "전달하실 내용 입력", required: false, options: null,                                    allowOther: false, displayOrder: 4, isActive: false },
];

@Controller("form-fields")
export class MockFormFieldsController {
  @Get()
  findAll(@Query("activeOnly") activeOnly?: string) {
    return activeOnly === "true" ? FORM_FIELDS.filter((f) => f.isActive) : FORM_FIELDS;
  }

  @Post()
  create(@Body() body: any) {
    const item = { id: FORM_FIELDS.length + 10, ...body };
    FORM_FIELDS = [...FORM_FIELDS, item];
    return item;
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: any) {
    FORM_FIELDS = FORM_FIELDS.map((f) => f.id === Number(id) ? { ...f, ...body } : f);
    return FORM_FIELDS.find((f) => f.id === Number(id)) ?? null;
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    FORM_FIELDS = FORM_FIELDS.filter((f) => f.id !== Number(id));
    return { success: true };
  }
}

// ─── Form Submissions ─────────────────────────────────────────────────────────

let FORM_SUBMISSIONS: any[] = [
  { id: 1, fieldData: { "이름": "홍길동", "연락처": "010-1234-5678", "방문목적": "예배 참석" }, submittedAt: past(3), churchId: null },
  { id: 2, fieldData: { "이름": "김영희", "연락처": "010-9876-5432", "방문목적": "상담 요청" }, submittedAt: past(1), churchId: null },
];

@Controller("form-submissions")
export class MockFormSubmissionsController {
  @Get()
  findAll() { return [...FORM_SUBMISSIONS].reverse(); }

  @Post()
  create(@Body() body: any) {
    const item = { id: FORM_SUBMISSIONS.length + 10, fieldData: body.fieldData ?? {}, submittedAt: new Date(), churchId: body.churchId ?? null };
    FORM_SUBMISSIONS = [...FORM_SUBMISSIONS, item];
    return { success: true, id: item.id };
  }
}

// ─── Site Config ──────────────────────────────────────────────────────────────

let SITE_CONFIG: any[] = [
  { id: 1, key: "church_name",  value: "영신교회",                    description: "교회 이름" },
  { id: 2, key: "map_address",  value: "서울특별시 양천구 목동로 19길 28", description: "교회 주소" },
  { id: 3, key: "map_embed_url", value: "",                           description: "카카오맵 임베드 URL (비어있으면 링크로 대체)" },
];

@Controller("site-config")
export class MockSiteConfigController {
  @Get()
  findAll() { return SITE_CONFIG; }

  @Patch(":key")
  update(@Param("key") key: string, @Body("value") value: string) {
    SITE_CONFIG = SITE_CONFIG.map((c) => c.key === key ? { ...c, value } : c);
    return SITE_CONFIG.find((c) => c.key === key) ?? null;
  }
}
