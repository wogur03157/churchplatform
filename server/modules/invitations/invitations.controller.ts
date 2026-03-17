import { Controller, Get, HttpCode, Inject, Param, Post, UseGuards } from "@nestjs/common";
import { InvitationsService } from "./invitations.service";
import { AdminGuard } from "../auth/guards/admin.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { User } from "../users/entities/user.entity";

@Controller("invitations")
export class InvitationsController {
  constructor(
    @Inject(InvitationsService)
    private readonly invitationsService: InvitationsService,
  ) {}

  @Get(":token")
  findOne(@Param("token") token: string) {
    return this.invitationsService.findByToken(token);
  }

  @Post(":token/accept")
  @HttpCode(200)
  @UseGuards(AdminGuard)
  accept(@Param("token") token: string, @CurrentUser() user: User) {
    return this.invitationsService.accept(token, user.id);
  }
}
