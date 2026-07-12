import { Module } from "@nestjs/common";
import { PlatformAuthModule } from "@platform/auth";
import { TenantOrmModule } from "@platform/tenancy";
import { AuditModule } from "../audit/audit.module";
import { Account, Department } from "../settings/settings.entities";
import { ExpenseAttachment, ExpenseRequest } from "./expenses.entities";
import { ExpensesController } from "./expenses.controller";
import { ExpensesService } from "./expenses.service";

@Module({
  imports: [
    TenantOrmModule.forFeature([ExpenseRequest, ExpenseAttachment, Account, Department]),
    PlatformAuthModule,
    AuditModule,
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
