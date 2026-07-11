import { Module } from "@nestjs/common";
import { PlatformAuthModule } from "@platform/auth";
import { TenantOrmModule } from "@platform/tenancy";
import { Member } from "../members/member.entity";
import { FamiliesController } from "./families.controller";
import { FamiliesService } from "./families.service";
import { Family } from "./family.entity";

@Module({
  imports: [TenantOrmModule.forFeature([Family, Member]), PlatformAuthModule],
  controllers: [FamiliesController],
  providers: [FamiliesService],
})
export class FamiliesModule {}
