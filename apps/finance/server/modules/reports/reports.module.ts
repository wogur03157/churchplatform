import { Module } from "@nestjs/common";
import { PlatformAuthModule } from "@platform/auth";
import { TenantOrmModule } from "@platform/tenancy";
import { ExpenseRequest } from "../expenses/expenses.entities";
import { Offering } from "../offerings/offerings.entities";
import { Account, Department, FinanceConfig, FiscalYear } from "../settings/settings.entities";
import { PublicReportsController, ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";

@Module({
  imports: [
    TenantOrmModule.forFeature([
      Offering,
      ExpenseRequest,
      Account,
      Department,
      FiscalYear,
      FinanceConfig,
    ]),
    PlatformAuthModule,
  ],
  controllers: [ReportsController, PublicReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
