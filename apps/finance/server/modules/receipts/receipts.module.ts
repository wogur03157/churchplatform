import { Module } from "@nestjs/common";
import { PlatformAuthModule } from "@platform/auth";
import { TenantOrmModule } from "@platform/tenancy";
import { AuditModule } from "../audit/audit.module";
import { Offering } from "../offerings/offerings.entities";
import { Account, FinanceConfig } from "../settings/settings.entities";
import { DonationReceipt } from "./receipt.entity";
import { ReceiptsController } from "./receipts.controller";
import { ReceiptsService } from "./receipts.service";

@Module({
  imports: [
    TenantOrmModule.forFeature([DonationReceipt, Offering, Account, FinanceConfig]),
    PlatformAuthModule,
    AuditModule,
  ],
  controllers: [ReceiptsController],
  providers: [ReceiptsService],
})
export class ReceiptsModule {}
