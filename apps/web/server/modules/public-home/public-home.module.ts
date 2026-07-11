import { Module } from "@nestjs/common";
import { TenantOrmModule } from "@platform/tenancy";
import { Announcement } from "../announcements/entities/announcement.entity";
import { ContentCategory } from "../content-pages/entities/content-category.entity";
import { ContentPage } from "../content-pages/entities/content-page.entity";
import { ContentPagesModule } from "../content-pages/content-pages.module";
import { FloatingMessage } from "../floating-messages/entities/floating-message.entity";
import { HeroSlide } from "../hero-slides/entities/hero-slide.entity";
import { LayoutSettingsModule } from "../layout-settings/layout-settings.module";
import { Media } from "../media/entities/media.entity";
import { Popup } from "../popups/entities/popup.entity";
import { SiteConfig } from "../site-config/entities/site-config.entity";
import { PublicHomeController } from "./public-home.controller";
import { PublicHomeService } from "./public-home.service";

@Module({
  imports: [
    TenantOrmModule.forFeature([
      Announcement,
      ContentCategory,
      ContentPage,
      Media,
      SiteConfig,
      HeroSlide,
      FloatingMessage,
      Popup,
    ]),
    LayoutSettingsModule,
    ContentPagesModule,
  ],
  controllers: [PublicHomeController],
  providers: [PublicHomeService],
})
export class PublicHomeModule {}
