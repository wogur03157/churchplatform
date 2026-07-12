import { Module } from "@nestjs/common";
import { PlatformAuthModule } from "@platform/auth";
import { TenantOrmModule } from "@platform/tenancy";
import { AuditModule } from "../audit/audit.module";
import { ClosingLock } from "./closing-lock.entity";
import { ClosingsController } from "./closings.controller";
import { ClosingsService } from "./closings.service";

@Module({
  imports: [TenantOrmModule.forFeature([ClosingLock]), PlatformAuthModule, AuditModule],
  controllers: [ClosingsController],
  providers: [ClosingsService],
  exports: [ClosingsService],
})
export class ClosingsModule {}
