import { Controller, Get, HttpCode, Post, Req, Res } from "@nestjs/common";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
import type { Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const MOCK_SUPER_ADMIN_USER = {
  id: 1,
  openId: "__dev_admin__",
  name: "Dev Admin",
  email: "dev@admin.local",
  loginMethod: "dev",
  role: "super_admin",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  lastSignedIn: new Date(),
};

const MOCK_CHURCH_ADMIN_USER = {
  id: 2,
  openId: "__dev_church_admin__",
  name: "Dev Church Admin",
  email: "dev@church.local",
  loginMethod: "dev",
  role: "church_admin",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  lastSignedIn: new Date(),
};

function getSecretKey() {
  return new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret-key");
}

function getCookieOptions(req: Request) {
  const isSecure =
    req.protocol === "https" ||
    (req.headers["x-forwarded-proto"] as string)
      ?.split(",")
      .some((p) => p.trim() === "https");

  return {
    httpOnly: true,
    path: "/",
    sameSite: (isSecure ? "none" : "lax") as "none" | "lax",
    secure: isSecure,
  };
}

@Controller("auth")
export class MockAuthController {
  private async issueToken(req: Request, res: Response, openId: string, name: string) {
    const secretKey = getSecretKey();
    const expirationSeconds = Math.floor((Date.now() + ONE_YEAR_MS) / 1000);
    const token = await new SignJWT({ openId, name })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
    res.cookie(COOKIE_NAME, token, { ...getCookieOptions(req), maxAge: ONE_YEAR_MS });
  }

  @Post("dev-login")
  @HttpCode(200)
  async devLogin(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.issueToken(req, res, MOCK_SUPER_ADMIN_USER.openId, MOCK_SUPER_ADMIN_USER.name);
    return { success: true };
  }

  @Post("dev-church-login")
  @HttpCode(200)
  async devChurchLogin(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.issueToken(req, res, MOCK_CHURCH_ADMIN_USER.openId, MOCK_CHURCH_ADMIN_USER.name);
    return { success: true };
  }

  @Get("me")
  async getMe(@Req() req: Request) {
    const cookies = parseCookieHeader(req.headers.cookie ?? "");
    const cookieValue = cookies[COOKIE_NAME];
    if (!cookieValue) return null;

    try {
      const { payload } = await jwtVerify(cookieValue, getSecretKey(), { algorithms: ["HS256"] });
      const mockUser =
        payload.openId === MOCK_CHURCH_ADMIN_USER.openId
          ? MOCK_CHURCH_ADMIN_USER
          : MOCK_SUPER_ADMIN_USER;
      const user = { ...mockUser, lastSignedIn: new Date() };
      // mock: 모든 기능/권한 허용
      const ALL_PERM_KEYS = [
        "announcements", "images", "videos", "video_categories",
        "floating_messages", "popups", "layout_settings",
        "page_groups", "form_config", "form_submissions",
      ];
      const permissions = user.role === "super_admin" ? null : ALL_PERM_KEYS;
      const enabledFeatures = null;
      return { ...user, permissions, enabledFeatures };
    } catch {
      return null;
    }
  }

  @Post("logout")
  @HttpCode(200)
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_NAME, { ...getCookieOptions(req), maxAge: -1 });
    return { success: true };
  }
}
