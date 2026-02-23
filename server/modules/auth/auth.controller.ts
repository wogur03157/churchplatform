import { Controller, Get, HttpCode, Inject, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { CurrentUser } from "./decorators/current-user.decorator";
import { OptionalAuthGuard } from "./guards/optional-auth.guard";
import { AuthService } from "./auth.service";
import type { User } from "../users/entities/user.entity";

@Controller("auth")
@UseGuards(OptionalAuthGuard)
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService
  ) {}

  @Get("me")
  getMe(@CurrentUser() user: User | null) {
    return user;
  }

  @Post("logout")
  @HttpCode(200)
  logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    this.authService.clearSession(req, res);
    return { success: true };
  }
}
