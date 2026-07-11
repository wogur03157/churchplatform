import { Controller, Get, Req } from "@nestjs/common";
import type { Request } from "express";

@Controller()
export class HealthController {
  @Get("health")
  health() {
    return { status: "ok", service: "members", timestamp: new Date().toISOString() };
  }

  /** 테넌시 연결 확인용 — 요청이 어느 교회로 식별됐는지 반환 */
  @Get("tenant")
  tenant(@Req() req: Request) {
    return {
      church: req.church ? { id: req.church.id, slug: req.church.slug, name: req.church.name } : null,
    };
  }
}
