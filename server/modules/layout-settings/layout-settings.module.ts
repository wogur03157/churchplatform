import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { ChurchesModule } from "../churches/churches.module";
import { LayoutSetting } from "./entities/layout-setting.entity";
import { LayoutSettingsController } from "./layout-settings.controller";
import { LayoutSettingsService } from "./layout-settings.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([LayoutSetting]),
    AuthModule,
    ChurchesModule,
  ],
  controllers: [LayoutSettingsController],
  providers: [LayoutSettingsService],
})
export class LayoutSettingsModule {}
