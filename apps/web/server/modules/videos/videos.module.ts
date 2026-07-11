import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { MediaModule } from "../media/media.module";
import { StorageModule } from "../storage/storage.module";
import { VideosController } from "./videos.controller";
import { VideosService } from "./videos.service";

@Module({
  imports: [MediaModule, AuthModule, StorageModule],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}
