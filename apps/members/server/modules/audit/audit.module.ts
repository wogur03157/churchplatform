import { Module } from "@nestjs/common";
import { TenantOrmModule } from "@platform/tenancy";
import { AuditService } from "./audit.service";
import { MemberAuditLog } from "./member-audit-log.entity";

@Module({
  imports: [TenantOrmModule.forFeature([MemberAuditLog])],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
