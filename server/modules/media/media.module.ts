import { Module } from "@nestjs/common";
import { TenantOrmModule } from "../tenancy/tenant-orm.module";
import { ContentCategory } from "../content-pages/entities/content-category.entity";
import { Image } from "../images/entities/image.entity";
import { VideoCategory } from "../video-categories/entities/video-category.entity";
import { Video } from "../videos/entities/video.entity";
import { Media } from "./entities/media.entity";
import { MediaService } from "./media.service";

@Module({
  imports: [TenantOrmModule.forFeature([Media, ContentCategory, Video, Image, VideoCategory])],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
