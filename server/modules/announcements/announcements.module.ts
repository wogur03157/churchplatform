import { Module } from "@nestjs/common";
import { TenantOrmModule } from "../tenancy/tenant-orm.module";
import { AuthModule } from "../auth/auth.module";
import { AnnouncementsController } from "./announcements.controller";
import { AnnouncementsService } from "./announcements.service";
import { Announcement } from "./entities/announcement.entity";

@Module({
  imports: [TenantOrmModule.forFeature([Announcement]), AuthModule],
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService],
})
export class AnnouncementsModule {}
