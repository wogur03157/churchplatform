import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { CurrentUser, PermissionGuard, RequirePermission } from "@platform/auth";
import type { User } from "@platform/entities";
import { ReceiptsService } from "./receipts.service";

/**
 * 기부금영수증 — 집계·대장 조회는 finance,
 * 발급·취소·국세청 파일·단체정보는 finance_approve(allow-list).
 */
@Controller("receipts")
@UseGuards(PermissionGuard)
@RequirePermission("finance")
export class ReceiptsController {
  constructor(
    @Inject(ReceiptsService)
    private readonly service: ReceiptsService
  ) {}

  /** 교인별 연간 헌금 집계 + 발급 상태 */
  @Get("aggregate")
  aggregate(@Query("year") year: string) {
    return this.service.aggregate(parseInt(year));
  }

  /** 발급 대장 */
  @Get()
  findAll(@Query("year") year: string) {
    return this.service.findAll(parseInt(year));
  }

  /** 단체 정보 (영수증 발급인란) */
  @Get("org-info")
  async orgInfo() {
    return {
      orgName: await this.service.getConfig("org_name"),
      orgTaxId: await this.service.getConfig("org_tax_id"),
    };
  }

  @Put("org-info")
  @RequirePermission("finance_approve", { defaultDeny: true })
  async setOrgInfo(@Body() body: { orgName: string; orgTaxId: string }) {
    await this.service.setOrgInfo(body.orgName ?? "", body.orgTaxId ?? "");
    return { success: true };
  }

  /** 국세청 제출용 CSV 다운로드 — 주민번호 포함, 발급 권한 전용 */
  @Get("nts-file")
  @RequirePermission("finance_approve", { defaultDeny: true })
  async ntsFile(
    @Query("year") year: string,
    @CurrentUser() user: User,
    @Res() res: Response
  ) {
    const { csv } = await this.service.ntsFile(parseInt(year), user.id);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="nts-donations-${year}.csv"`
    );
    res.send(csv);
  }

  /** 영수증 출력용 상세 (주민번호 마스킹) */
  @Get(":id(\\d+)")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post("issue")
  @RequirePermission("finance_approve", { defaultDeny: true })
  issue(
    @Body()
    body: {
      year: number;
      items: Array<{ memberId: number; donorName: string; rrn?: string | null }>;
    },
    @CurrentUser() user: User
  ) {
    return this.service.issue(body.year, body.items, user.id);
  }

  @Post(":id(\\d+)/cancel")
  @RequirePermission("finance_approve", { defaultDeny: true })
  async cancel(@Param("id", ParseIntPipe) id: number, @CurrentUser() user: User) {
    await this.service.cancel(id, user.id);
    return { success: true };
  }
}
