import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { MediaModule } from "../media/media.module";
import { VideoCategoriesController } from "./video-categories.controller";
import { VideoCategoriesService } from "./video-categories.service";

@Module({
  imports: [MediaModule, AuthModule],
  controllers: [VideoCategoriesController],
  providers: [VideoCategoriesService],
  exports: [VideoCategoriesService],
})
export class VideoCategoriesModule {}
