import { Module } from "@nestjs/common";
import { TenantOrmModule } from "../tenancy/tenant-orm.module";
import { AuthModule } from "../auth/auth.module";
import { ChurchesModule } from "../churches/churches.module";
import { StorageModule } from "../storage/storage.module";
import { LayoutSetting } from "./entities/layout-setting.entity";
import { LayoutSettingsController } from "./layout-settings.controller";
import { LayoutSettingsService } from "./layout-settings.service";

@Module({
  imports: [
    TenantOrmModule.forFeature([LayoutSetting]),
    AuthModule,
    ChurchesModule,
    StorageModule,
  ],
  controllers: [LayoutSettingsController],
  providers: [LayoutSettingsService],
  exports: [LayoutSettingsService],
})
export class LayoutSettingsModule {}
