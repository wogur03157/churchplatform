import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { PermissionGuard, RequirePermission } from "@platform/auth";
import { assertDateString, parseIntParam } from "../../lib/validate";
import { ReportsService } from "./reports.service";

/** 재정 보고서 — 월간(제직회)·주간(주보) + 투명성 설정 */
@Controller("reports")
@UseGuards(PermissionGuard)
@RequirePermission("finance")
export class ReportsController {
  constructor(
    @Inject(ReportsService)
    private readonly service: ReportsService
  ) {}

  @Get("monthly")
  monthly(@Query("year") year: string, @Query("month") month: string) {
    return this.service.monthly(
      parseIntParam(year, "연도", 2000, 2100),
      parseIntParam(month, "월", 1, 12)
    );
  }

  @Get("weekly")
  weekly(@Query("date") date: string) {
    return this.service.weekly(assertDateString(date));
  }

  @Get("transparency")
  async transparency() {
    return { enabled: await this.service.isTransparencyEnabled() };
  }

  @Put("transparency")
  @RequirePermission("finance_approve", { defaultDeny: true })
  async setTransparency(@Body() body: { enabled: boolean }) {
    await this.service.setTransparency(!!body.enabled);
    return { success: true };
  }
}

/**
 * 공개 월간 요약 — 교회가 투명성 공개를 켠 경우에만 응답 (비인증).
 * 개인 정보 없이 집계 금액만 노출된다.
 */
@Controller("public")
export class PublicReportsController {
  constructor(
    @Inject(ReportsService)
    private readonly service: ReportsService
  ) {}

  @Get("monthly-report")
  async monthlyReport(
    @Req() req: Request,
    @Query("year") year?: string,
    @Query("month") month?: string
  ) {
    if (!req.church) throw new NotFoundException();
    if (!(await this.service.isTransparencyEnabled())) {
      throw new NotFoundException("이 교회는 재정 공개를 사용하지 않습니다");
    }
    const now = new Date();
    // 기본값: 지난달 (당월은 아직 마감 전이므로)
    const y = year ? parseInt(year) : now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const m = month ? parseInt(month) : now.getMonth() === 0 ? 12 : now.getMonth();
    return this.service.monthly(y, m);
  }
}
