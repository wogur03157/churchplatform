import { Module } from "@nestjs/common";
import { PlatformAuthModule } from "@platform/auth";
import { TenantOrmModule } from "@platform/tenancy";
import { AttendanceRecord, AttendanceSession } from "./attendance.entity";
import { AttendanceController } from "./attendance.controller";
import { AttendanceService } from "./attendance.service";

@Module({
  imports: [
    TenantOrmModule.forFeature([AttendanceSession, AttendanceRecord]),
    PlatformAuthModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
