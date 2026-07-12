import { Module } from "@nestjs/common";
import { PlatformAuthModule } from "@platform/auth";
import { TenantOrmModule } from "@platform/tenancy";
import { Member } from "../members/member.entity";
import { GroupsController } from "./groups.controller";
import { GroupsService } from "./groups.service";
import { MemberGroup, MemberGroupMember } from "./member-group.entity";

@Module({
  imports: [
    TenantOrmModule.forFeature([MemberGroup, MemberGroupMember, Member]),
    PlatformAuthModule,
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
