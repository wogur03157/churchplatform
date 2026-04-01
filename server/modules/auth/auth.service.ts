import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
import type { Request, Response } from "express";
import { Repository } from "typeorm";
import { ChurchAdmin } from "../churches/entities/church-admin.entity";
import { User } from "../users/entities/user.entity";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ChurchAdmin)
    private readonly churchAdminRepository: Repository<ChurchAdmin>
  ) {}

  private getSecretKey(): Uint8Array {
    const secret = process.env.JWT_SECRET ?? "";
    return new TextEncoder().encode(secret);
  }

  async exchangeCodeForToken(code: string): Promise<{ accessToken: string }> {
    const callbackUrl = process.env.OAUTH_CALLBACK_URL ?? "";
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID ?? "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
      }),
    });
    if (!response.ok) {
      const msg = await response.text();
      throw new Error(`Google token exchange failed (${response.status}): ${msg}`);
    }
    const data = await response.json();
    return { accessToken: data.access_token };
  }

  async getUserInfo(accessToken: string): Promise<{
    openId: string;
    name: string | null;
    email: string | null;
    loginMethod: string;
  }> {
    const response = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      const msg = await response.text();
      throw new Error(`Google userinfo failed (${response.status}): ${msg}`);
    }
    const data = await response.json();
    return {
      openId: data.id as string,
      name: (data.name as string) ?? null,
      email: (data.email as string) ?? null,
      loginMethod: "google",
    };
  }

  async createSessionToken(openId: string, name: string): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
    const secretKey = this.getSecretKey();

    return new SignJWT({ openId, name })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<{ openId: string; name: string } | null> {
    if (!cookieValue) return null;

    try {
      const secretKey = this.getSecretKey();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });
      const { openId, name } = payload as Record<string, unknown>;

      if (typeof openId !== "string" || typeof name !== "string") {
        return null;
      }

      return { openId, name };
    } catch {
      return null;
    }
  }

  async upsertUser(data: {
    openId: string;
    name?: string | null;
    email?: string | null;
    loginMethod?: string | null;
    lastSignedIn?: Date;
  }): Promise<void> {
    const ownerOpenId = process.env.OWNER_OPEN_ID ?? "";
    const role = data.openId === ownerOpenId ? "super_admin" : undefined;

    let user = await this.userRepository.findOne({ where: { openId: data.openId } });

    if (user) {
      if (data.name !== undefined) user.name = data.name;
      if (data.email !== undefined) user.email = data.email;
      if (data.loginMethod !== undefined) user.loginMethod = data.loginMethod;
      user.lastSignedIn = data.lastSignedIn ?? new Date();
      if (role) user.role = role;
    } else {
      user = this.userRepository.create({
        openId: data.openId,
        name: data.name ?? null,
        email: data.email ?? null,
        loginMethod: data.loginMethod ?? null,
        lastSignedIn: data.lastSignedIn ?? new Date(),
        ...(role ? { role } : {}),
      });
    }

    await this.userRepository.save(user);
  }

  async getUserByOpenId(openId: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { openId } });
  }

  async devLogin(): Promise<string> {
    if (process.env.NODE_ENV !== "development") {
      throw new Error("Dev login is only available in development mode");
    }
    const devOpenId = "__dev_admin__";
    await this.userRepository.upsert(
      {
        openId: devOpenId,
        name: "Dev Admin",
        email: "dev@admin.local",
        loginMethod: "dev",
        role: "super_admin",
        lastSignedIn: new Date(),
      },
      { conflictPaths: ["openId"] }
    );
    return this.createSessionToken(devOpenId, "Dev Admin");
  }

  async devChurchLogin(): Promise<string> {
    if (process.env.NODE_ENV !== "development") {
      throw new Error("Dev login is only available in development mode");
    }

    const devOpenId = "__dev_church_admin__";
    await this.userRepository.upsert(
      {
        openId: devOpenId,
        name: "Dev Church Admin",
        email: "dev@church.local",
        loginMethod: "dev",
        role: "church_admin",
        lastSignedIn: new Date(),
      },
      { conflictPaths: ["openId"] }
    );

    const user = await this.userRepository.findOneOrFail({
      where: { openId: devOpenId },
    });

    const existingAdminLink = await this.churchAdminRepository.findOne({
      where: { churchId: 1, userId: user.id },
    });

    if (!existingAdminLink) {
      await this.churchAdminRepository.save(
        this.churchAdminRepository.create({
          churchId: 1,
          userId: user.id,
        })
      );
    }

    return this.createSessionToken(devOpenId, "Dev Church Admin");
  }

  async authenticateRequest(req: Request): Promise<User | null> {
    const cookies = parseCookieHeader(req.headers.cookie ?? "");
    const session = await this.verifySession(cookies[COOKIE_NAME]);

    if (!session) return null;

    const user = await this.getUserByOpenId(session.openId);
    if (!user) return null;


    return user;
  }

  getSessionCookieOptions(req: Request) {
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

  clearSession(req: Request, res: Response): void {
    const cookieOptions = this.getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
  }
}

