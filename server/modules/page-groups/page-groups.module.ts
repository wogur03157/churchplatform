import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PageGroup } from "./entities/page-group.entity";
import { PageGroupsController } from "./page-groups.controller";
import { PageGroupsService } from "./page-groups.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([PageGroup]), AuthModule],
  controllers: [PageGroupsController],
  providers: [PageGroupsService],
  exports: [PageGroupsService],
})
export class PageGroupsModule {}
