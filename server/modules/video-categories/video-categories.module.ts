import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VideoCategory } from "./entities/video-category.entity";
import { VideoCategoriesController } from "./video-categories.controller";
import { VideoCategoriesService } from "./video-categories.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([VideoCategory]), AuthModule],
  controllers: [VideoCategoriesController],
  providers: [VideoCategoriesService],
  exports: [VideoCategoriesService],
})
export class VideoCategoriesModule {}
