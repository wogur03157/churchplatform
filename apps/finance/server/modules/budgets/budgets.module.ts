import { Module } from "@nestjs/common";
import { PlatformAuthModule } from "@platform/auth";
import { TenantOrmModule } from "@platform/tenancy";
import { AuditModule } from "../audit/audit.module";
import { ExpenseRequest } from "../expenses/expenses.entities";
import { Account, Department } from "../settings/settings.entities";
import { Budget } from "./budget.entity";
import { BudgetsController } from "./budgets.controller";
import { BudgetsService } from "./budgets.service";

@Module({
  imports: [
    TenantOrmModule.forFeature([Budget, Account, Department, ExpenseRequest]),
    PlatformAuthModule,
    AuditModule,
  ],
  controllers: [BudgetsController],
  providers: [BudgetsService],
  exports: [BudgetsService],
})
export class BudgetsModule {}
