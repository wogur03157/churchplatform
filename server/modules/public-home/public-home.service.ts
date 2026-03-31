import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Announcement } from "../announcements/entities/announcement.entity";
import { ContentPagesService } from "../content-pages/content-pages.service";
import { FloatingMessage } from "../floating-messages/entities/floating-message.entity";
import { HeroSlide } from "../hero-slides/entities/hero-slide.entity";
import { LayoutSettingsService } from "../layout-settings/layout-settings.service";
import { Media } from "../media/entities/media.entity";
import { Popup } from "../popups/entities/popup.entity";
import { SiteConfig } from "../site-config/entities/site-config.entity";

@Injectable()
export class PublicHomeService {
  private readonly publicChurchId = 1;

  constructor(
    @Inject(LayoutSettingsService)
    private readonly layoutSettingsService: LayoutSettingsService,
    @Inject(ContentPagesService)
    private readonly contentPagesService: ContentPagesService,
    @InjectRepository(Announcement)
    private readonly announcementRepo: Repository<Announcement>,
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

    const [
      layoutSettings,
      announcements,
      images,
      videos,
      siteConfigs,
      heroSlides,
      floatingMessages,
      popups,
      categoryForest,
    ] = await Promise.all([
      this.layoutSettingsService.findAll(this.publicChurchId),
      this.announcementRepo
        .createQueryBuilder("announcement")
        .where("announcement.status = :status", { status: "published" })
        .orderBy("announcement.createdAt", "DESC")
        .limit(6)
        .getMany(),
      this.mediaRepo.find({
        where: {
          mediaType: "image",
          status: "published",
          showOnHome: true,
        },
        order: { displayOrder: "ASC", createdAt: "DESC" },
      }),
      this.mediaRepo.find({
        where: {
          mediaType: "video",
          status: "published",
        },
        order: { displayOrder: "ASC", createdAt: "DESC" },
      }),
      this.siteConfigRepo.find({ order: { id: "ASC" } }),
      this.heroSlideRepo.find({
        where: { status: "visible" },
        order: { displayOrder: "ASC" },
      }),
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
    };
  }
}
