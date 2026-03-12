import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HealthController } from "./modules/health/health.controller";
import { MockModule } from "./modules/mock/mock.module";
import { Church } from "./modules/churches/entities/church.entity";
import { ChurchAdmin } from "./modules/churches/entities/church-admin.entity";
import { ChurchFeature } from "./modules/churches/entities/church-feature.entity";
import { ChurchesModule } from "./modules/churches/churches.module";
import { PopupsModule } from "./modules/popups/popups.module";
import { Popup } from "./modules/popups/entities/popup.entity";
import { AiAssistantModule } from "./modules/ai-assistant/ai-assistant.module";
import { AnnouncementsModule } from "./modules/announcements/announcements.module";
import { Announcement } from "./modules/announcements/entities/announcement.entity";
import { AuthModule } from "./modules/auth/auth.module";
import { FloatingMessage } from "./modules/floating-messages/entities/floating-message.entity";
import { FloatingMessagesModule } from "./modules/floating-messages/floating-messages.module";
import { Image } from "./modules/images/entities/image.entity";
import { ImagesModule } from "./modules/images/images.module";
import { LayoutSetting } from "./modules/layout-settings/entities/layout-setting.entity";
import { LayoutSettingsModule } from "./modules/layout-settings/layout-settings.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { OAuthModule } from "./modules/oauth/oauth.module";
import { StorageModule } from "./modules/storage/storage.module";
import { User } from "./modules/users/entities/user.entity";
import { Video } from "./modules/videos/entities/video.entity";
import { VideosModule } from "./modules/videos/videos.module";
import { PageGroup } from "./modules/page-groups/entities/page-group.entity";
import { PageGroupsModule } from "./modules/page-groups/page-groups.module";
import { VideoCategory } from "./modules/video-categories/entities/video-category.entity";
import { VideoCategoriesModule } from "./modules/video-categories/video-categories.module";
import { FormField } from "./modules/form-fields/entities/form-field.entity";
import { FormFieldsModule } from "./modules/form-fields/form-fields.module";
import { FormSubmission } from "./modules/form-submissions/entities/form-submission.entity";
import { FormSubmissionsModule } from "./modules/form-submissions/form-submissions.module";
import { SiteConfig } from "./modules/site-config/entities/site-config.entity";
import { SiteConfigModule } from "./modules/site-config/site-config.module";

// DB가 설정되지 않았거나 SKIP_DB=true 이면 DB 관련 모듈 전체 스킵
// (AuthModule이 UserRepository에 의존하므로 AuthModule을 쓰는 모든 모듈 함께 제외)
const dbUrl = process.env.DATABASE_URL ?? "";
const isDbEnabled =
  process.env.SKIP_DB !== "true" &&
  dbUrl.length > 0 &&
  !dbUrl.includes("user:password@host");

if (!isDbEnabled) {
  console.warn("[AppModule] DB disabled — running in no-db mode (health endpoint only)");
}

const dbModules = isDbEnabled
  ? [
      TypeOrmModule.forRoot({
        type: "mysql",
        url: dbUrl,
        entities: [User, Announcement, Image, Video, FloatingMessage, LayoutSetting, Church, ChurchAdmin, ChurchFeature, Popup, PageGroup, VideoCategory, FormField, FormSubmission, SiteConfig],
        synchronize: false,
        logging: process.env.NODE_ENV === "development",
      }),
      AuthModule,
      OAuthModule,
      AnnouncementsModule,
      ImagesModule,
      VideosModule,
      FloatingMessagesModule,
      LayoutSettingsModule,
      ChurchesModule,
      PopupsModule,
      AiAssistantModule,
      StorageModule,
      NotificationsModule,
      PageGroupsModule,
      VideoCategoriesModule,
      FormFieldsModule,
      FormSubmissionsModule,
      SiteConfigModule,
    ]
  : [];

@Module({
  controllers: [HealthController],
  imports: [...dbModules, ...(!isDbEnabled ? [MockModule] : [])],
})
export class AppModule {}
