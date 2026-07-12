import { Module } from "@nestjs/common";
import { TenantOrmModule } from "@platform/tenancy";
import { AuditService } from "./audit.service";
import { FinanceAuditLog } from "./finance-audit-log.entity";

@Module({
  imports: [TenantOrmModule.forFeature([FinanceAuditLog])],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
