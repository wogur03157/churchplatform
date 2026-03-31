import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { ContentPagesController } from "./content-pages.controller";
import { ContentPagesService } from "./content-pages.service";
import { ContentCategory } from "./entities/content-category.entity";
import { ContentPage } from "./entities/content-page.entity";
import { ContentPageMedia } from "./entities/content-page-media.entity";

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([ContentCategory, ContentPage, ContentPageMedia])],
  controllers: [ContentPagesController],
  providers: [ContentPagesService],
  exports: [ContentPagesService],
})
export class ContentPagesModule {}
