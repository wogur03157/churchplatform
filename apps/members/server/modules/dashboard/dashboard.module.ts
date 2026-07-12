import { Module } from "@nestjs/common";
import { PlatformAuthModule } from "@platform/auth";
import { TenantOrmModule } from "@platform/tenancy";
import { AttendanceRecord } from "../attendance/attendance.entity";
import { Member } from "../members/member.entity";
import { NewcomerProgress, NewcomerStage } from "../newcomers/newcomer.entity";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

@Module({
  imports: [
    TenantOrmModule.forFeature([Member, AttendanceRecord, NewcomerStage, NewcomerProgress]),
    PlatformAuthModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
