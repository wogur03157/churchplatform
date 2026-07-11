import { Module } from "@nestjs/common";
import { PlatformAuthModule } from "@platform/auth";
import { TenantOrmModule } from "@platform/tenancy";
import { AuditModule } from "../audit/audit.module";
import { Member } from "./member.entity";
import { MembersController } from "./members.controller";
import { MembersService } from "./members.service";

@Module({
  imports: [TenantOrmModule.forFeature([Member]), PlatformAuthModule, AuditModule],
  controllers: [MembersController],
  providers: [MembersService],
})
export class MembersModule {}
