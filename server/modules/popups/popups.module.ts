import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { StorageModule } from "../storage/storage.module";
import { Popup } from "./entities/popup.entity";
import { PopupsController } from "./popups.controller";
import { PopupsService } from "./popups.service";

@Module({
  imports: [TypeOrmModule.forFeature([Popup]), AuthModule, StorageModule],
  controllers: [PopupsController],
  providers: [PopupsService],
})
export class PopupsModule {}
