import { Module } from "@nestjs/common";
import { TenantOrmModule } from "../tenancy/tenant-orm.module";
import { PageGroup } from "./entities/page-group.entity";
import { PageGroupsController } from "./page-groups.controller";
import { PageGroupsService } from "./page-groups.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TenantOrmModule.forFeature([PageGroup]), AuthModule],
  controllers: [PageGroupsController],
  providers: [PageGroupsService],
  exports: [PageGroupsService],
})
export class PageGroupsModule {}
