import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HealthController } from "./modules/health/health.controller";
import { MockModule } from "./modules/mock/mock.module";
import { Church } from "./modules/churches/entities/church.entity";
import { ChurchAdmin } from "./modules/churches/entities/church-admin.entity";
import { ChurchFeature } from "./modules/churches/entities/church-feature.entity";
import { ChurchesModule } from "./modules/churches/churches.module";
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
        entities: [User, Announcement, Image, Video, FloatingMessage, LayoutSetting, Church, ChurchAdmin, ChurchFeature],
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
      AiAssistantModule,
      StorageModule,
      NotificationsModule,
    ]
  : [];

@Module({
  controllers: [HealthController],
  imports: [...dbModules, ...(!isDbEnabled ? [MockModule] : [])],
})
export class AppModule {}
