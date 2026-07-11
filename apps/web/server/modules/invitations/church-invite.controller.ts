import { Body, Controller, HttpCode, Inject, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { InvitationsService } from "./invitations.service";
import { OptionalAuthGuard } from "@platform/auth";
import { SuperAdminGuard } from "@platform/auth";

@Controller("churches")
@UseGuards(OptionalAuthGuard)
export class ChurchInviteController {
  constructor(
    @Inject(InvitationsService)
    private readonly invitationsService: InvitationsService,
  ) {}

  /** POST /api/churches/:id/admins/invite */
  @Post(":id/admins/invite")
  @HttpCode(200)
  @UseGuards(SuperAdminGuard)
  inviteAdmin(
    @Param("id", ParseIntPipe) id: number,
    @Body("email") email: string,
  ) {
    return this.invitationsService.createInvite(id, email);
  }
}
