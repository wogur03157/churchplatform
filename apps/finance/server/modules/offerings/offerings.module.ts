import { Module } from "@nestjs/common";
import { PlatformAuthModule } from "@platform/auth";
import { TenantOrmModule } from "@platform/tenancy";
import { AuditModule } from "../audit/audit.module";
import { Account } from "../settings/settings.entities";
import { Offering, OfferingBatch } from "./offerings.entities";
import { OfferingsController } from "./offerings.controller";
import { OfferingsService } from "./offerings.service";

@Module({
  imports: [
    TenantOrmModule.forFeature([Offering, OfferingBatch, Account]),
    PlatformAuthModule,
    AuditModule,
  ],
  controllers: [OfferingsController],
  providers: [OfferingsService],
})
export class OfferingsModule {}
