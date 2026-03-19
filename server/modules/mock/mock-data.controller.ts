import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from "@nestjs/common";
import {
  ANNOUNCEMENTS, IMAGES, VIDEOS, FLOATING_MESSAGES, LAYOUT_SETTINGS,
  POPUPS, CHURCHES, FEATURES, ALL_FEATURE_KEYS, ADMINS, VIDEO_CATEGORIES,
  PAGE_GROUPS, FORM_FIELDS, FORM_SUBMISSIONS, ADMIN_PERMISSIONS, ALL_PERM_KEYS,
  SITE_CONFIG, INVITATIONS, HERO_SLIDES, getEnabledFeatures,
} from "./mock-store";

// mock-auth.controller 등 다른 모듈에서 사용할 수 있도록 재export
export { getEnabledFeatures };

// ─── Announcements ────────────────────────────────────────────────────────────

@Controller("announcements")
export class MockAnnouncementsController {
  @Get()
  findAll() { return ANNOUNCEMENTS; }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return ANNOUNCEMENTS.find((a) => a.id === Number(id)) ?? null;
  }

  @Post()
  create(@Body() body: any) {
    const item = { ...ANNOUNCEMENTS[0], id: ANNOUNCEMENTS.length + 10, title: body.title ?? "[Mock] 새 공지사항", createdAt: new Date(), updatedAt: new Date() };
    ANNOUNCEMENTS.push(item);
    return item;
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: any) {
    const idx = ANNOUNCEMENTS.findIndex((a) => a.id === Number(id));
    if (idx !== -1) ANNOUNCEMENTS[idx] = { ...ANNOUNCEMENTS[idx], ...body, updatedAt: new Date() };
    return ANNOUNCEMENTS[idx] ?? null;
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    const idx = ANNOUNCEMENTS.findIndex((a) => a.id === Number(id));
    if (idx !== -1) ANNOUNCEMENTS.splice(idx, 1);
    return { success: true };
  }
}

// ─── Images ───────────────────────────────────────────────────────────────────

@Controller("images")
export class MockImagesController {
  @Get()
  findAll() { return IMAGES; }

  @Get(":id")
  findOne(@Param("id") id: string) { return IMAGES.find((i) => i.id === Number(id)) ?? null; }

  @Post()
  create(@Body() body: any) {
    const item = { ...IMAGES[0], id: IMAGES.length + 10, title: body.title ?? "[Mock] 새 이미지", createdAt: new Date(), updatedAt: new Date() };
    IMAGES.push(item);
    return item;
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: any) {
    const idx = IMAGES.findIndex((i) => i.id === Number(id));
    if (idx !== -1) IMAGES[idx] = { ...IMAGES[idx], ...body, updatedAt: new Date() };
    return IMAGES[idx] ?? null;
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    const idx = IMAGES.findIndex((i) => i.id === Number(id));
    if (idx !== -1) IMAGES.splice(idx, 1);
    return { success: true };
  }
}

// ─── Videos ───────────────────────────────────────────────────────────────────

@Controller("videos")
export class MockVideosController {
  @Get()
  findAll(
    @Query("category") category?: string,
    @Query("publishedOnly") publishedOnly?: string,
  ) {
    let result = [...VIDEOS];
    if (publishedOnly === "true") result = result.filter((v) => v.status === "published");
    if (category) {
      result = category === "special"
        ? result.filter((v) => !["sunday", "wednesday", "friday"].includes(v.category))
        : result.filter((v) => v.category === category);
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
      status: body.status ?? "draft",
      createdAt: new Date(), updatedAt: new Date(),
    };
    VIDEOS.push(newVideo);
    return { success: true, id: newVideo.id };
  }

  @Post("upload-file")
  uploadFile() { return { success: true, message: "Mock mode: file upload skipped" }; }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: any) {
    const idx = VIDEOS.findIndex((v) => v.id === Number(id));
    if (idx !== -1) VIDEOS[idx] = { ...VIDEOS[idx], ...body, updatedAt: new Date() };
    return VIDEOS[idx] ?? null;
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    const idx = VIDEOS.findIndex((v) => v.id !== Number(id));
    VIDEOS.splice(0, VIDEOS.length, ...VIDEOS.filter((v) => v.id !== Number(id)));
    return { success: true };
  }
}

// ─── Floating Messages ────────────────────────────────────────────────────────

@Controller("floating-messages")
export class MockFloatingMessagesController {
  @Get()
  findAll() { return FLOATING_MESSAGES; }

  @Get(":id")
  findOne(@Param("id") id: string) { return FLOATING_MESSAGES.find((m) => m.id === Number(id)) ?? null; }

  @Post()
  create(@Body() body: any) {
    const item = { ...FLOATING_MESSAGES[0], id: FLOATING_MESSAGES.length + 10, title: body.title ?? "[Mock] 새 메시지", createdAt: new Date(), updatedAt: new Date() };
    FLOATING_MESSAGES.push(item);
    return item;
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: any) {
    const idx = FLOATING_MESSAGES.findIndex((m) => m.id === Number(id));
    if (idx !== -1) FLOATING_MESSAGES[idx] = { ...FLOATING_MESSAGES[idx], ...body, updatedAt: new Date() };
    return FLOATING_MESSAGES[idx] ?? null;
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    const idx = FLOATING_MESSAGES.findIndex((m) => m.id === Number(id));
    if (idx !== -1) FLOATING_MESSAGES.splice(idx, 1);
    return { success: true };
  }
}

// ─── Layout Settings ──────────────────────────────────────────────────────────

@Controller("layout-settings")
export class MockLayoutSettingsController {
  @Get()
  findAll() { return LAYOUT_SETTINGS; }

  @Post("save-all")
  saveAll(@Body() body: any[]) {
    if (Array.isArray(body)) {
      for (let i = 0; i < LAYOUT_SETTINGS.length; i++) {
        const incoming = body.find((b) => b.sectionType === LAYOUT_SETTINGS[i].sectionType);
        if (!incoming) continue;
        LAYOUT_SETTINGS[i] = {
          ...LAYOUT_SETTINGS[i],
          status: incoming.status ?? LAYOUT_SETTINGS[i].status,
          displayOrder: incoming.displayOrder ?? LAYOUT_SETTINGS[i].displayOrder,
          colSpan: incoming.colSpan ?? LAYOUT_SETTINGS[i].colSpan,
          title: incoming.title ?? LAYOUT_SETTINGS[i].title,
          subtitle: incoming.subtitle ?? LAYOUT_SETTINGS[i].subtitle,
          imageKey: incoming.imageKey !== undefined ? incoming.imageKey : LAYOUT_SETTINGS[i].imageKey,
          imageUrl: incoming.imageUrl !== undefined ? incoming.imageUrl : LAYOUT_SETTINGS[i].imageUrl,
          updatedAt: new Date(),
        };
      }
    }
    return { success: true };
  }

  @Post("upsert")
  upsert(@Body() body: any) {
    const idx = LAYOUT_SETTINGS.findIndex((s) => s.sectionType === body.sectionType);
    if (idx !== -1) LAYOUT_SETTINGS[idx] = { ...LAYOUT_SETTINGS[idx], ...body, updatedAt: new Date() };
    return LAYOUT_SETTINGS[idx] ?? null;
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: any) {
    const idx = LAYOUT_SETTINGS.findIndex((s) => s.id === Number(id));
    if (idx !== -1) LAYOUT_SETTINGS[idx] = { ...LAYOUT_SETTINGS[idx], ...body, updatedAt: new Date() };
    return LAYOUT_SETTINGS[idx] ?? null;
  }
}

// ─── AI Assistant ─────────────────────────────────────────────────────────────

@Controller("ai-assistant")
export class MockAiAssistantController {
  @Post("improve-text")
  improveText() {
    return { result: "[Mock] AI 어시스턴트는 DB 연결 후 사용 가능합니다." };
  }
}

// ─── Popups ───────────────────────────────────────────────────────────────────

@Controller("popups")
export class MockPopupsController {
  @Get()
  findAll(@Query("activeOnly") activeOnly?: string) {
    if (activeOnly === "true") {
      const now = new Date();
      return POPUPS.filter(
        (p) => p.status === "active"
          && (p.startDate === null || p.startDate <= now)
          && (p.endDate === null || p.endDate >= now),
      );
    }
    return POPUPS;
  }

  @Get(":id")
  findOne(@Param("id") id: string) { return POPUPS.find((p) => p.id === Number(id)) ?? null; }

  @Post()
  create(@Body() body: any) {
    const popup = {
      id: POPUPS.length + 10, churchId: null,
      title: body.title ?? "[Mock] 새 팝업",
      imageKey: null,
      imageUrl: body.imageUrl ?? "https://picsum.photos/seed/new/800/600",
      linkUrl: body.linkUrl ?? null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      status: body.status ?? "inactive",
      createdBy: 1, createdAt: new Date(), updatedAt: new Date(),
    };
    POPUPS.push(popup);
    return { success: true, id: popup.id, imageUrl: popup.imageUrl };
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: any) {
    const idx = POPUPS.findIndex((p) => p.id === Number(id));
    if (idx !== -1) {
      POPUPS[idx] = {
        ...POPUPS[idx],
        ...(body.title !== undefined && { title: body.title }),
        ...(body.linkUrl !== undefined && { linkUrl: body.linkUrl || null }),
        ...(body.startDate !== undefined && { startDate: body.startDate ? new Date(body.startDate) : null }),
        ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
        ...(body.status !== undefined && { status: body.status }),
        updatedAt: new Date(),
      };
    }
    return { success: true };
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    const idx = POPUPS.findIndex((p) => p.id === Number(id));
    if (idx !== -1) POPUPS.splice(idx, 1);
    return { success: true };
  }
}

// ─── Churches ─────────────────────────────────────────────────────────────────

@Controller("churches")
export class MockChurchesController {
  @Get("slug/:slug")
  findBySlug(@Param("slug") slug: string) {
    return CHURCHES.find((c) => c.slug === slug) ?? null;
  }

  @Get("my")
  myChurches() { return CHURCHES.filter((c) => c.id === 2); }

  @Get("my/features")
  myFeatures() { return FEATURES.filter((f) => f.churchId === 2); }

  @Get()
  findAll() { return CHURCHES; }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return CHURCHES.find((c) => c.id === Number(id)) ?? null;
  }

  @Post("apply")
  apply(@Body() body: any) {
    const newChurch = {
      id: CHURCHES.length + 10,
      name: body.name ?? "[Mock] 신규 교회", slug: body.slug ?? "new-church",
      status: "pending", description: body.description ?? null,
      email: body.email ?? null, phone: body.phone ?? null, address: body.address ?? null,
      logoUrl: null, customDomain: null,
      appliedBy: 1, approvedBy: null, approvedAt: null, rejectedReason: null,
      createdAt: new Date(), updatedAt: new Date(),
    };
    CHURCHES.push(newChurch);
    return newChurch;
  }

  @Post(":id/review")
  @HttpCode(200)
  review(@Param("id") id: string, @Body() body: { action: "active" | "rejected"; rejectedReason?: string }) {
    const idx = CHURCHES.findIndex((c) => c.id === Number(id));
    if (idx !== -1) {
      CHURCHES[idx] = {
        ...CHURCHES[idx], status: body.action,
        rejectedReason: body.rejectedReason ?? null,
        approvedBy: body.action === "active" ? 1 : null,
        approvedAt: body.action === "active" ? new Date() : null,
        updatedAt: new Date(),
      };
    }
    return CHURCHES[idx] ?? null;
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: any) {
    const idx = CHURCHES.findIndex((c) => c.id === Number(id));
    if (idx !== -1) CHURCHES[idx] = { ...CHURCHES[idx], ...body, updatedAt: new Date() };
    return CHURCHES[idx] ?? null;
  }

  @Get(":id/features")
  getFeatures(@Param("id") id: string) {
    const churchId = Number(id);
    const existing = FEATURES.filter((f) => f.churchId === churchId);
    if (existing.length === 0) {
      const newFeatures = ALL_FEATURE_KEYS.map((key, i) => ({
        id: FEATURES.length + i + 1, churchId, featureKey: key, status: "enabled", updatedBy: null, updatedAt: new Date(),
      }));
      FEATURES.push(...newFeatures);
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
    const newStatus = isEnabled ? "enabled" : "disabled";
    const idx = FEATURES.findIndex((f) => f.churchId === churchId && f.featureKey === featureKey);
    if (idx !== -1) {
      FEATURES[idx] = { ...FEATURES[idx], status: newStatus, updatedAt: new Date() };
    } else {
      FEATURES.push({ id: FEATURES.length + 1, churchId, featureKey, status: newStatus, updatedBy: null, updatedAt: new Date() });
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

  @Post(":id/admins/invite")
  @HttpCode(200)
  inviteAdmin(@Param("id") id: string, @Body("email") email: string) {
    const churchId = Number(id);
    const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    INVITATIONS.push({ id: INVITATIONS.length + 1, churchId, email, token, expiresAt, usedAt: null, createdAt: new Date() });
    const inviteUrl = `/admin/invite?token=${token}`;
    console.log(`[Mock] 초대 메일 → ${email} : ${inviteUrl}`);
    return { token, inviteUrl };
  }
}

// ─── Video Categories ─────────────────────────────────────────────────────────

@Controller("video-categories")
export class MockVideoCategoriesController {
  @Get()
  findAll() { return VIDEO_CATEGORIES; }

  @Post()
  create(@Body() body: any) {
    const item = { id: VIDEO_CATEGORIES.length + 10, name: body.name, slug: body.slug, isBuiltIn: false, displayOrder: body.displayOrder ?? 99 };
    VIDEO_CATEGORIES.push(item);
    return item;
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: any) {
    const idx = VIDEO_CATEGORIES.findIndex((c) => c.id === Number(id));
    if (idx !== -1) VIDEO_CATEGORIES[idx] = { ...VIDEO_CATEGORIES[idx], ...body };
    return VIDEO_CATEGORIES[idx] ?? null;
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    const item = VIDEO_CATEGORIES.find((c) => c.id === Number(id));
    if (item?.isBuiltIn) return { success: false, message: "기본 카테고리는 삭제할 수 없습니다." };
    const idx = VIDEO_CATEGORIES.findIndex((c) => c.id === Number(id));
    if (idx !== -1) VIDEO_CATEGORIES.splice(idx, 1);
    return { success: true };
  }
}

// ─── Page Groups ──────────────────────────────────────────────────────────────

@Controller("page-groups")
export class MockPageGroupsController {
  @Get()
  findAll(@Query("groupKey") groupKey?: string) {
    const result = groupKey ? PAGE_GROUPS.filter((g) => g.groupKey === groupKey) : [...PAGE_GROUPS];
    return result.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  @Get("by-slug/:groupKey/:slug")
  findBySlug(@Param("groupKey") groupKey: string, @Param("slug") slug: string) {
    return PAGE_GROUPS.find((g) => g.groupKey === groupKey && g.slug === slug) ?? null;
  }

  @Get(":id")
  findOne(@Param("id") id: string) { return PAGE_GROUPS.find((g) => g.id === Number(id)) ?? null; }

  @Post()
  create(@Body() body: any) {
    const item = { id: PAGE_GROUPS.length + 10, ...body, createdAt: new Date(), updatedAt: new Date() };
    PAGE_GROUPS.push(item);
    return item;
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: any) {
    const idx = PAGE_GROUPS.findIndex((g) => g.id === Number(id));
    if (idx !== -1) PAGE_GROUPS[idx] = { ...PAGE_GROUPS[idx], ...body, updatedAt: new Date() };
    return PAGE_GROUPS[idx] ?? null;
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    const idx = PAGE_GROUPS.findIndex((g) => g.id === Number(id));
    if (idx !== -1) PAGE_GROUPS.splice(idx, 1);
    return { success: true };
  }
}

// ─── Form Fields ──────────────────────────────────────────────────────────────

@Controller("form-fields")
export class MockFormFieldsController {
  @Get()
  findAll(@Query("activeOnly") activeOnly?: string) {
    return activeOnly === "true" ? FORM_FIELDS.filter((f) => f.status === "active") : FORM_FIELDS;
  }

  @Post()
  create(@Body() body: any) {
    const item = { id: FORM_FIELDS.length + 10, ...body };
    FORM_FIELDS.push(item);
    return item;
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: any) {
    const idx = FORM_FIELDS.findIndex((f) => f.id === Number(id));
    if (idx !== -1) FORM_FIELDS[idx] = { ...FORM_FIELDS[idx], ...body };
    return FORM_FIELDS[idx] ?? null;
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    const idx = FORM_FIELDS.findIndex((f) => f.id === Number(id));
    if (idx !== -1) FORM_FIELDS.splice(idx, 1);
    return { success: true };
  }
}

// ─── Form Submissions ─────────────────────────────────────────────────────────

@Controller("form-submissions")
export class MockFormSubmissionsController {
  @Get()
  findAll() { return [...FORM_SUBMISSIONS].reverse(); }

  @Post()
  create(@Body() body: any) {
    const item = { id: FORM_SUBMISSIONS.length + 10, fieldData: body.fieldData ?? {}, submittedAt: new Date(), churchId: body.churchId ?? null };
    FORM_SUBMISSIONS.push(item);
    return { success: true, id: item.id };
  }
}

// ─── Admin Permissions ────────────────────────────────────────────────────────

@Controller("admins")
export class MockAdminPermissionsController {
  @Get()
  findAll(@Query("churchId") churchId?: string) {
    return churchId ? ADMINS.filter((a) => a.churchId === Number(churchId)) : ADMINS;
  }

  @Get(":id/permissions")
  getPermissions(@Param("id") id: string) {
    const permissions = ADMIN_PERMISSIONS
      .filter((p) => p.adminId === Number(id) && p.status === "allowed")
      .map((p) => p.permKey);
    return { permissions };
  }

  @Patch(":id/permissions")
  updatePermission(
    @Param("id") id: string,
    @Body() body: { permKey: string; status: "allowed" | "denied" },
  ) {
    const adminId = Number(id);
    const idx = ADMIN_PERMISSIONS.findIndex((p) => p.adminId === adminId && p.permKey === body.permKey);
    if (idx !== -1) {
      ADMIN_PERMISSIONS[idx] = { ...ADMIN_PERMISSIONS[idx], status: body.status };
    } else {
      ADMIN_PERMISSIONS.push({ adminId, permKey: body.permKey, status: body.status });
    }
    return { success: true };
  }
}

// ─── Site Config ──────────────────────────────────────────────────────────────

@Controller("site-config")
export class MockSiteConfigController {
  @Get()
  findAll() { return SITE_CONFIG; }

  @Patch(":key")
  update(@Param("key") key: string, @Body("value") value: string) {
    const idx = SITE_CONFIG.findIndex((c) => c.key === key);
    if (idx !== -1) SITE_CONFIG[idx] = { ...SITE_CONFIG[idx], value };
    return SITE_CONFIG[idx] ?? null;
  }
}

// ─── Hero Slides ──────────────────────────────────────────────────────────────

@Controller("hero-slides")
export class MockHeroSlidesController {
  @Get()
  findAll() {
    return [...HERO_SLIDES]
      .filter((s) => s.status === "visible")
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  @Get("all")
  findAllAdmin() {
    return [...HERO_SLIDES].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  @Post()
  create(@Body() body: any) {
    const item = {
      id: HERO_SLIDES.length + 10,
      type: body.type ?? "text",
      title: body.title ?? "",
      subtitle: body.subtitle ?? null,
      imageUrl: body.imageUrl ?? null,
      imageKey: body.imageKey ?? null,
      displayOrder: body.displayOrder ?? HERO_SLIDES.length + 1,
      status: body.status ?? "visible",
      churchId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    HERO_SLIDES.push(item);
    return item;
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: any) {
    const idx = HERO_SLIDES.findIndex((s) => s.id === Number(id));
    if (idx !== -1) HERO_SLIDES[idx] = { ...HERO_SLIDES[idx], ...body, updatedAt: new Date() };
    return HERO_SLIDES[idx] ?? null;
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    const idx = HERO_SLIDES.findIndex((s) => s.id === Number(id));
    if (idx !== -1) HERO_SLIDES.splice(idx, 1);
    return { success: true };
  }
}

// ─── Invitations ──────────────────────────────────────────────────────────────

@Controller("invitations")
export class MockInvitationsController {
  @Get(":token")
  findOne(@Param("token") token: string) {
    const inv = INVITATIONS.find((i) => i.token === token);
    if (!inv) return null;
    const church = CHURCHES.find((c) => c.id === inv.churchId);
    return {
      valid: !inv.usedAt && new Date() < inv.expiresAt,
      email: inv.email,
      churchId: inv.churchId,
      churchName: church?.name ?? null,
      expiresAt: inv.expiresAt,
      used: !!inv.usedAt,
    };
  }

  @Post(":token/accept")
  @HttpCode(200)
  accept(@Param("token") token: string) {
    const idx = INVITATIONS.findIndex((i) => i.token === token);
    if (idx === -1) return { success: false, message: "유효하지 않은 초대입니다" };
    const inv = INVITATIONS[idx];
    if (inv.usedAt) return { success: false, message: "이미 사용된 초대입니다" };
    if (new Date() > inv.expiresAt) return { success: false, message: "만료된 초대입니다" };
    INVITATIONS[idx] = { ...inv, usedAt: new Date() };
    ADMINS.push({ id: ADMINS.length + 10, churchId: inv.churchId, name: "초대된 관리자", email: inv.email, role: "church_admin" });
    return { success: true };
  }
}
