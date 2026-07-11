import { Inject, Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import { Church } from "@platform/entities";
import { TenancyService } from "./tenancy.service";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      church?: Church | null;
    }
  }
}

/**
 * 요청이 어느 교회 것인지 식별해 req.church에 주입합니다.
 *
 * 식별 우선순위:
 *   1. x-church-slug 헤더 (개발/테스트용)
 *   2. Host가 교회의 customDomain과 일치
 *   3. Host가 `<slug>.${TENANT_BASE_DOMAIN}` 형태의 서브도메인
 *   4. DEFAULT_CHURCH_SLUG 환경변수 (단일 교회 배포 호환)
 *
 * 식별 실패는 에러가 아닙니다 — /apply, /super-admin, /auth 등
 * 교회 컨텍스트가 필요 없는 요청도 이 미들웨어를 지나갑니다.
 */
@Injectable()
export class TenantResolverMiddleware implements NestMiddleware {
  constructor(
    @Inject(TenancyService)
    private readonly tenancy: TenancyService
  ) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      req.church = await this.resolve(req);
    } catch {
      req.church = null;
    }
    next();
  }

  private async resolve(req: Request): Promise<Church | null> {
    const headerSlug = req.headers["x-church-slug"];
    if (typeof headerSlug === "string" && headerSlug.length > 0) {
      const church = await this.tenancy.findChurchBySlug(headerSlug);
      if (church) return church;
    }

    const host = (req.headers.host ?? "").split(":")[0].toLowerCase();
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      const byDomain = await this.tenancy.findChurchByDomain(host);
      if (byDomain) return byDomain;

      const baseDomain = (process.env.TENANT_BASE_DOMAIN ?? "").toLowerCase();
      if (baseDomain && host.endsWith(`.${baseDomain}`)) {
        const subdomain = host.slice(0, -(baseDomain.length + 1));
        if (subdomain && !subdomain.includes(".") && subdomain !== "www") {
          const bySubdomain = await this.tenancy.findChurchBySlug(subdomain);
          if (bySubdomain) return bySubdomain;
        }
      }
    }

    const defaultSlug = process.env.DEFAULT_CHURCH_SLUG ?? "";
    if (defaultSlug) {
      return this.tenancy.findChurchBySlug(defaultSlug);
    }

    return null;
  }
}
