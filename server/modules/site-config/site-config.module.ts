import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SiteConfig } from "./entities/site-config.entity";
import { SiteConfigController } from "./site-config.controller";
import { SiteConfigService } from "./site-config.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([SiteConfig]), AuthModule],
  controllers: [SiteConfigController],
  providers: [SiteConfigService],
  exports: [SiteConfigService],
})
export class SiteConfigModule {}
