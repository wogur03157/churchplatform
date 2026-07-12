import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlatformAuthModule } from "@platform/auth";
import { PLATFORM_ENTITIES } from "@platform/entities";
import { TenancyModule } from "@platform/tenancy";
import { HealthController } from "./modules/health/health.controller";
import { AttendanceModule } from "./modules/attendance/attendance.module";
import { AuditModule } from "./modules/audit/audit.module";
import { CareModule } from "./modules/care/care.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { FamiliesModule } from "./modules/families/families.module";
import { GroupsModule } from "./modules/groups/groups.module";
import { MembersModule } from "./modules/members/members.module";
import { NewcomersModule } from "./modules/newcomers/newcomers.module";
import { PositionsModule } from "./modules/positions/positions.module";
import { TENANT_ENTITIES } from "./tenant-entities";
import { seedTenantDefaults } from "./tenant-seed";

const dbUrl = process.env.DATABASE_URL ?? "";
const isDbEnabled = process.env.SKIP_DB !== "true" && dbUrl.length > 0;

if (!isDbEnabled) {
  console.warn("[members] DB disabled - health endpoint only");
}

const dbModules = isDbEnabled
  ? [
      TypeOrmModule.forRoot({
        type: "mysql",
        url: dbUrl,
        entities: [...PLATFORM_ENTITIES, ...TENANT_ENTITIES],
        synchronize: false,
        logging: process.env.NODE_ENV === "development",
      }),
      TenancyModule.forRoot({
        tenantEntities: [...TENANT_ENTITIES],
        seedTenant: seedTenantDefaults,
      }),
      PlatformAuthModule,
      AuditModule,
      PositionsModule,
      FamiliesModule,
      GroupsModule,
      AttendanceModule,
      NewcomersModule,
      DashboardModule,
      CareModule,
      // MembersModule은 루트 경로(:id 와일드카드)를 쓰므로 마지막에 등록
      MembersModule,
    ]
  : [];

@Module({
  controllers: [HealthController],
  imports: dbModules,
})
export class AppModule {}
