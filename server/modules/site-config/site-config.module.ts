import { Module } from "@nestjs/common";
import { TenantOrmModule } from "../tenancy/tenant-orm.module";
import { SiteConfig } from "./entities/site-config.entity";
import { SiteConfigController } from "./site-config.controller";
import { SiteConfigService } from "./site-config.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TenantOrmModule.forFeature([SiteConfig]), AuthModule],
  controllers: [SiteConfigController],
  providers: [SiteConfigService],
  exports: [SiteConfigService],
})
export class SiteConfigModule {}
