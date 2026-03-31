import { Controller, ForbiddenException, Get, HttpCode, Inject, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
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

  @Post("dev-login")
  @HttpCode(200)
  async devLogin(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    if (process.env.NODE_ENV !== "development") {
      throw new ForbiddenException("Dev login is not available in production");
    }
    const token = await this.authService.devLogin();
    const cookieOptions = this.authService.getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
    return { success: true };
  }

  @Post("dev-church-login")
  @HttpCode(200)
  async devChurchLogin(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    if (process.env.NODE_ENV !== "development") {
      throw new ForbiddenException("Dev login is not available in production");
    }
    const token = await this.authService.devChurchLogin();
    const cookieOptions = this.authService.getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
    return { success: true };
  }
}
