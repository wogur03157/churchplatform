import { Controller, Get, Inject, Query, Req, Res } from "@nestjs/common";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Request, Response } from "express";
import { AuthService } from "@platform/auth";

@Controller("oauth")
export class OAuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService
  ) {}

  @Get("google")
  googleLogin(@Req() req: Request, @Res() res: Response) {
    const callbackUrl =
      process.env.OAUTH_CALLBACK_URL ??
      `${req.protocol}://${req.headers.host}/api/oauth/callback`;

    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID ?? "");
    url.searchParams.set("redirect_uri", callbackUrl);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("access_type", "online");

    res.redirect(302, url.toString());
  }

  @Get("callback")
  async callback(
    @Query("code") code: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    if (!code) {
      res.status(400).json({ error: "code is required" });
      return;
    }

    try {
      const tokenResponse = await this.authService.exchangeCodeForToken(code);
      const userInfo = await this.authService.getUserInfo(
        tokenResponse.accessToken
      );

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await this.authService.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await this.authService.createSessionToken(
        userInfo.openId,
        userInfo.name || ""
      );

      const cookieOptions = this.authService.getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  }
}
