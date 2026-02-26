import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";

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

const VIDEOS = [
  {
    id: 1,
    title: "서비스 소개 영상",
    description: "서비스를 소개하는 유튜브 영상입니다.",
    videoType: "youtube",
    fileKey: null,
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    mimeType: null,
    fileSize: null,
    duration: 212,
    uploadedBy: 1,
    isPublished: 1,
    displayOrder: 1,
    createdAt: past(14),
    updatedAt: past(14),
  },
  {
    id: 2,
    title: "[초안] 튜토리얼 영상",
    description: "사용 방법을 안내하는 튜토리얼입니다.",
    videoType: "youtube",
    fileKey: null,
    url: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
    thumbnailUrl: null,
    mimeType: null,
    fileSize: null,
    duration: null,
    uploadedBy: 1,
    isPublished: 0,
    displayOrder: 2,
    createdAt: past(2),
    updatedAt: past(2),
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

const LAYOUT_SETTINGS = [
  { id: 1, sectionType: "hero", isVisible: 1, displayOrder: 1, title: "환영합니다", subtitle: "서비스 소개 문구가 여기에 표시됩니다.", updatedBy: 1, updatedAt: now },
  { id: 2, sectionType: "announcements", isVisible: 1, displayOrder: 2, title: "공지사항", subtitle: null, updatedBy: 1, updatedAt: now },
  { id: 3, sectionType: "images", isVisible: 1, displayOrder: 3, title: "갤러리", subtitle: null, updatedBy: 1, updatedAt: now },
  { id: 4, sectionType: "videos", isVisible: 1, displayOrder: 4, title: "영상", subtitle: null, updatedBy: 1, updatedAt: now },
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
  findAll() { return VIDEOS; }

  @Get(":id")
  findOne(@Param("id") id: string) { return VIDEOS.find((v) => v.id === Number(id)) ?? null; }

  @Post()
  create() { return { ...VIDEOS[0], id: 99, title: "[Mock] 새 영상", createdAt: new Date(), updatedAt: new Date() }; }

  @Post("upload-file")
  uploadFile() { return { success: true, message: "Mock mode: file upload skipped" }; }

  @Patch(":id")
  update(@Param("id") id: string) { return VIDEOS.find((v) => v.id === Number(id)) ?? null; }

  @Delete(":id")
  remove() { return { success: true }; }
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

  @Post("upsert")
  upsert() { return LAYOUT_SETTINGS[0]; }

  @Patch(":id")
  update(@Param("id") id: string) { return LAYOUT_SETTINGS.find((s) => s.id === Number(id)) ?? null; }
}

@Controller("ai-assistant")
export class MockAiAssistantController {
  @Post("improve-text")
  improveText() {
    return { result: "[Mock] AI 어시스턴트는 DB 연결 후 사용 가능합니다." };
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
