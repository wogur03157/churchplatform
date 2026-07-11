import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Invitation } from "./entities/invitation.entity";
import { InvitationsController } from "./invitations.controller";
import { ChurchInviteController } from "./church-invite.controller";
import { InvitationsService } from "./invitations.service";
import { ChurchAdmin } from "@platform/entities";
import { User } from "@platform/entities";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([Invitation, ChurchAdmin, User]), AuthModule],
  controllers: [InvitationsController, ChurchInviteController],
  providers: [InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}
