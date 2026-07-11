import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PLATFORM_ENTITIES } from "@platform/entities";
import { TenancyModule } from "@platform/tenancy";
import { HealthController } from "./modules/health/health.controller";
import { MockModule } from "./modules/mock/mock.module";
import { ChurchesModule } from "./modules/churches/churches.module";
import { PopupsModule } from "./modules/popups/popups.module";
import { AiAssistantModule } from "./modules/ai-assistant/ai-assistant.module";
import { AnnouncementsModule } from "./modules/announcements/announcements.module";
import { AuthModule } from "./modules/auth/auth.module";
import { FloatingMessagesModule } from "./modules/floating-messages/floating-messages.module";
import { ImagesModule } from "./modules/images/images.module";
import { LayoutSettingsModule } from "./modules/layout-settings/layout-settings.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { OAuthModule } from "./modules/oauth/oauth.module";
import { StorageModule } from "./modules/storage/storage.module";
import { VideosModule } from "./modules/videos/videos.module";
import { PageGroupsModule } from "./modules/page-groups/page-groups.module";
import { VideoCategoriesModule } from "./modules/video-categories/video-categories.module";
import { FormFieldsModule } from "./modules/form-fields/form-fields.module";
import { FormSubmissionsModule } from "./modules/form-submissions/form-submissions.module";
import { SiteConfigModule } from "./modules/site-config/site-config.module";
import { Invitation } from "./modules/invitations/entities/invitation.entity";
import { InvitationsModule } from "./modules/invitations/invitations.module";
import { HeroSlidesModule } from "./modules/hero-slides/hero-slides.module";
import { ContentPagesModule } from "./modules/content-pages/content-pages.module";
import { PublicHomeModule } from "./modules/public-home/public-home.module";
import { TENANT_ENTITIES } from "./tenant-entities";
import { seedTenantDefaults } from "./tenant-seed";

const dbUrl = process.env.DATABASE_URL ?? "";
const isDbEnabled =
  process.env.SKIP_DB !== "true" &&
  dbUrl.length > 0 &&
  !dbUrl.includes("user:password@host");

if (!isDbEnabled) {
  console.warn(
    "[AppModule] DB disabled - running in no-db mode (health endpoint only)"
  );
}

const dbModules = isDbEnabled
  ? [
      TypeOrmModule.forRoot({
        type: "mysql",
        url: dbUrl,
        // 중앙 DB 폴백(프로비저닝 전 교회)용으로 테넌트 엔티티도 함께 등록
        entities: [...PLATFORM_ENTITIES, Invitation, ...TENANT_ENTITIES],
        synchronize: false,
        logging: process.env.NODE_ENV === "development",
      }),
      TenancyModule.forRoot({
        tenantEntities: [...TENANT_ENTITIES],
        seedTenant: seedTenantDefaults,
      }),
      AuthModule,
      OAuthModule,
      InvitationsModule,
      ChurchesModule,
      AnnouncementsModule,
      ImagesModule,
      VideosModule,
      FloatingMessagesModule,
      LayoutSettingsModule,
      PopupsModule,
      AiAssistantModule,
      StorageModule,
      NotificationsModule,
      PageGroupsModule,
      VideoCategoriesModule,
      FormFieldsModule,
      FormSubmissionsModule,
      SiteConfigModule,
      HeroSlidesModule,
      ContentPagesModule,
      PublicHomeModule,
    ]
  : [];

@Module({
  controllers: [HealthController],
  imports: [...dbModules, ...(!isDbEnabled ? [MockModule] : [])],
})
export class AppModule {}
