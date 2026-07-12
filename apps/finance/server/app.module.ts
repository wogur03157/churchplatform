import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlatformAuthModule } from "@platform/auth";
import { PLATFORM_ENTITIES } from "@platform/entities";
import { TenancyModule } from "@platform/tenancy";
import { HealthController } from "./modules/health/health.controller";
import { AuditModule } from "./modules/audit/audit.module";
import { BudgetsModule } from "./modules/budgets/budgets.module";
import { ClosingsModule } from "./modules/closings/closings.module";
import { ExpensesModule } from "./modules/expenses/expenses.module";
import { OfferingsModule } from "./modules/offerings/offerings.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { SettingsModule } from "./modules/settings/settings.module";
import { TENANT_ENTITIES } from "./tenant-entities";
import { seedTenantDefaults } from "./tenant-seed";

const dbUrl = process.env.DATABASE_URL ?? "";
const isDbEnabled = process.env.SKIP_DB !== "true" && dbUrl.length > 0;

if (!isDbEnabled) {
  console.warn("[finance] DB disabled - health endpoint only");
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
      SettingsModule,
      ClosingsModule,
      BudgetsModule,
      OfferingsModule,
      ExpensesModule,
      ReportsModule,
    ]
  : [];

@Module({
  controllers: [HealthController],
  imports: dbModules,
})
export class AppModule {}
