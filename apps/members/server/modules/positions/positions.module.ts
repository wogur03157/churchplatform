import { Module } from "@nestjs/common";
import { PlatformAuthModule } from "@platform/auth";
import { TenantOrmModule } from "@platform/tenancy";
import { Position } from "./position.entity";
import { PositionsController } from "./positions.controller";
import { PositionsService } from "./positions.service";

@Module({
  imports: [TenantOrmModule.forFeature([Position]), PlatformAuthModule],
  controllers: [PositionsController],
  providers: [PositionsService],
})
export class PositionsModule {}
