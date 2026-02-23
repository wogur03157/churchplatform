import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HealthController } from "./modules/health/health.controller";
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

@Module({
  controllers: [HealthController],
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      url: process.env.DATABASE_URL,
      entities: [User, Announcement, Image, Video, FloatingMessage, LayoutSetting],
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
    AiAssistantModule,
    StorageModule,
    NotificationsModule,
  ],
})
export class AppModule {}
