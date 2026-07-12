import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Announcement } from "../announcements/entities/announcement.entity";
import { ContentCategory } from "../content-pages/entities/content-category.entity";
import { ContentPage } from "../content-pages/entities/content-page.entity";
import { ContentPagesService } from "../content-pages/content-pages.service";
import { FloatingMessage } from "../floating-messages/entities/floating-message.entity";
import { HeroSlide } from "../hero-slides/entities/hero-slide.entity";
import { LayoutSettingsService } from "../layout-settings/layout-settings.service";
import {
  LayoutSetting,
} from "../layout-settings/entities/layout-setting.entity";
import { Media } from "../media/entities/media.entity";
import { Popup } from "../popups/entities/popup.entity";
import { SiteConfig } from "../site-config/entities/site-config.entity";

type ContentCategorySectionData = {
  kind: "content_category";
  category: {
    id: number;
    name: string;
    slug: string;
    href: string | null;
  };
  page: {
    id: number;
    title: string;
    href: string | null;
    templateCode: string;
  } | null;
  children: Array<{
    id: number;
    name: string;
    slug: string;
    href: string | null;
    pageTitle: string | null;
  }>;
};

type MediaCategorySectionData = {
  kind: "media_category";
  category: {
    id: number;
    name: string;
    slug: string;
    href: string | null;
  };
  items: Array<{
    id: number;
    title: string;
    description: string | null;
    mediaType: "image" | "video";
    videoType: "upload" | "youtube" | "vimeo" | "url" | null;
    url: string;
    thumbnailUrl: string | null;
    href: string | null;
  }>;
};

type HomeSectionData = ContentCategorySectionData | MediaCategorySectionData;

@Injectable()
export class PublicHomeService {

  constructor(
    @Inject(LayoutSettingsService)
    private readonly layoutSettingsService: LayoutSettingsService,
    @Inject(ContentPagesService)
    private readonly contentPagesService: ContentPagesService,
    @InjectRepository(Announcement)
    private readonly announcementRepo: Repository<Announcement>,
    @InjectRepository(ContentCategory)
    private readonly contentCategoryRepo: Repository<ContentCategory>,
    @InjectRepository(ContentPage)
    private readonly contentPageRepo: Repository<ContentPage>,
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
    @InjectRepository(SiteConfig)
    private readonly siteConfigRepo: Repository<SiteConfig>,
    @InjectRepository(HeroSlide)
    private readonly heroSlideRepo: Repository<HeroSlide>,
    @InjectRepository(FloatingMessage)
    private readonly floatingMessageRepo: Repository<FloatingMessage>,
    @InjectRepository(Popup)
    private readonly popupRepo: Repository<Popup>,
  ) {}

  async getHomeData() {
    const now = new Date();
    const layoutSettings = await this.layoutSettingsService.findAll();
    const visibleSections = layoutSettings.filter((section) => section.status === "visible");

    const needsAnnouncements = visibleSections.some((section) => section.sectionType === "announcements");
    const needsImages = visibleSections.some((section) => section.sectionType === "images");
    const needsVideos = visibleSections.some((section) => section.sectionType === "videos");
    const needsHero = visibleSections.some((section) => section.sectionType === "hero");

    const [
      announcements,
      images,
      videos,
      siteConfigs,
      heroSlides,
      floatingMessages,
      popups,
      categoryForest,
      sectionDataById,
    ] = await Promise.all([
      needsAnnouncements
        ? this.announcementRepo
            .createQueryBuilder("announcement")
            .where("announcement.status = :status", { status: "published" })
            .orderBy("announcement.createdAt", "DESC")
            .limit(6)
            .getMany()
        : Promise.resolve([]),
      needsImages
        ? this.mediaRepo.find({
            where: {
              mediaType: "image",
              status: "published",
              showOnHome: true,
            },
            order: { displayOrder: "ASC", createdAt: "DESC" },
          })
        : Promise.resolve([]),
      needsVideos
        ? this.mediaRepo.find({
            where: {
              mediaType: "video",
              status: "published",
            },
            order: { displayOrder: "ASC", createdAt: "DESC" },
          })
        : Promise.resolve([]),
      this.siteConfigRepo.find({ order: { id: "ASC" } }),
      needsHero
        ? this.heroSlideRepo.find({
            where: { status: "visible" },
            order: { displayOrder: "ASC" },
          })
        : Promise.resolve([]),
      this.floatingMessageRepo
        .createQueryBuilder("floatingMessage")
        .where("floatingMessage.status = :status", { status: "active" })
        .andWhere("(floatingMessage.startDate IS NULL OR floatingMessage.startDate <= :now)", { now })
        .andWhere("(floatingMessage.endDate IS NULL OR floatingMessage.endDate >= :now)", { now })
        .orderBy("floatingMessage.createdAt", "DESC")
        .limit(1)
        .getMany(),
      this.popupRepo
        .createQueryBuilder("popup")
        .where("popup.status = :status", { status: "active" })
        .andWhere("(popup.startDate IS NULL OR popup.startDate <= :now)", { now })
        .andWhere("(popup.endDate IS NULL OR popup.endDate >= :now)", { now })
        .orderBy("popup.createdAt", "DESC")
        .limit(1)
        .getMany(),
      this.contentPagesService.findCategoryForest(),
      this.buildSectionDataMap(visibleSections),
    ]);

    return {
      layoutSettings,
      announcements,
      images,
      videos,
      siteConfigs,
      heroSlides,
      floatingMessages,
      popups,
      categoryForest,
      sectionDataById,
    };
  }

  private async buildSectionDataMap(layoutSettings: LayoutSetting[]) {
    const dynamicSections = layoutSettings.filter(
      (section) =>
        (section.sectionType === "content_category" || section.sectionType === "media_category") &&
        section.sourceCategoryId,
    );

    if (dynamicSections.length === 0) {
      return {} as Record<string, HomeSectionData>;
    }

    const contentSections = dynamicSections.filter(
      (section) => section.sectionType === "content_category",
    );
    const mediaSections = dynamicSections.filter(
      (section) => section.sectionType === "media_category",
    );

    const [contentData, mediaData] = await Promise.all([
      this.buildContentCategorySectionData(contentSections),
      this.buildMediaCategorySectionData(mediaSections),
    ]);

    return { ...contentData, ...mediaData };
  }

  private async buildContentCategorySectionData(layoutSettings: LayoutSetting[]) {
    if (layoutSettings.length === 0) {
      return {} as Record<string, ContentCategorySectionData>;
    }

    const categories = await this.contentCategoryRepo.find({
      where: { status: "active" },
      order: { depth: "ASC", sortOrder: "ASC", id: "ASC" },
    });
    const pages = await this.contentPageRepo.find({
      where: { status: "published" },
      order: { updatedAt: "DESC", id: "ASC" },
    });

    const categoryById = new Map(categories.map((category) => [category.id, category] as const));
    const pageByCategoryId = new Map(pages.map((page) => [page.categoryId, page] as const));
    const sectionDataById: Record<string, ContentCategorySectionData> = {};

    for (const section of layoutSettings) {
      const category = categoryById.get(section.sourceCategoryId ?? -1);
      if (!category) {
        continue;
      }

      const limit = this.resolveItemLimit(section.itemLimit, 6);
      const children = categories
        .filter((item) => item.parentId === category.id && item.status === "active")
        .slice(0, limit)
        .map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          href: this.buildContentHref(item, categoryById),
          pageTitle: pageByCategoryId.get(item.id)?.title ?? null,
        }));

      const page = pageByCategoryId.get(category.id);

      sectionDataById[String(section.id)] = {
        kind: "content_category",
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          href: this.buildContentHref(category, categoryById),
        },
        page: page
          ? {
              id: page.id,
              title: page.title,
              href: this.buildContentHref(category, categoryById),
              templateCode: page.templateCode,
            }
          : null,
        children,
      };
    }

    return sectionDataById;
  }

  private async buildMediaCategorySectionData(layoutSettings: LayoutSetting[]) {
    if (layoutSettings.length === 0) {
      return {} as Record<string, MediaCategorySectionData>;
    }

    const categoryIds = Array.from(
      new Set(layoutSettings.map((section) => section.sourceCategoryId).filter((id): id is number => typeof id === "number")),
    );
    const maxLimitByCategoryId = new Map<number, number>();

    for (const section of layoutSettings) {
      const categoryId = section.sourceCategoryId;
      if (!categoryId) {
        continue;
      }
      maxLimitByCategoryId.set(
        categoryId,
        Math.max(maxLimitByCategoryId.get(categoryId) ?? 0, this.resolveItemLimit(section.itemLimit, 6)),
      );
    }

    const [categories, rows] = await Promise.all([
      this.contentCategoryRepo.find({
        where: { id: In(categoryIds), status: "active" },
        order: { sortOrder: "ASC", id: "ASC" },
      }),
      this.mediaRepo.find({
        where: {
          categoryId: In(categoryIds),
          status: "published",
        },
        order: { displayOrder: "ASC", createdAt: "DESC" },
      }),
    ]);

    const categoryById = new Map(categories.map((category) => [category.id, category] as const));
    const rowsByCategoryId = new Map<number, Media[]>();

    for (const row of rows) {
      if (!row.categoryId) {
        continue;
      }
      const bucket = rowsByCategoryId.get(row.categoryId) ?? [];
      bucket.push(row);
      rowsByCategoryId.set(row.categoryId, bucket);
    }

    const sectionDataById: Record<string, MediaCategorySectionData> = {};

    for (const section of layoutSettings) {
      const categoryId = section.sourceCategoryId;
      if (!categoryId) {
        continue;
      }

      const category = categoryById.get(categoryId);
      if (!category) {
        continue;
      }

      const items = (rowsByCategoryId.get(categoryId) ?? [])
        .slice(0, this.resolveItemLimit(section.itemLimit, 6))
        .map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          mediaType: item.mediaType,
          videoType: item.videoType,
          url: item.url,
          thumbnailUrl: item.thumbnailUrl,
          href: this.buildMediaCategoryHref(category.slug),
        }));

      sectionDataById[String(section.id)] = {
        kind: "media_category",
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          href: this.buildMediaCategoryHref(category.slug),
        },
        items,
      };
    }

    return sectionDataById;
  }

  private buildContentHref(
    category: ContentCategory,
    categoryById: Map<number, ContentCategory>,
  ) {
    const path: string[] = [];
    let current: ContentCategory | undefined = category;

    while (current) {
      path.unshift(current.slug);
      current = current.parentId ? categoryById.get(current.parentId) : undefined;
    }

    if (path.length < 2) {
      return null;
    }

    return `/${path.join("/")}`;
  }

  private buildMediaCategoryHref(slug: string) {
    switch (slug) {
      case "sunday":
        return "/sermons/sunday";
      case "wednesday":
      case "friday":
        return "/sermons/midweek";
      case "special":
        return "/sermons/special";
      default:
        return null;
    }
  }

  private resolveItemLimit(itemLimit: number | null | undefined, fallback: number) {
    if (!itemLimit || itemLimit < 1) {
      return fallback;
    }
    return itemLimit;
  }
}
