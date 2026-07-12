import { Body, Controller, Get, Inject, Put, Query, UseGuards } from "@nestjs/common";
import { CurrentUser, PermissionGuard, RequirePermission } from "@platform/auth";
import type { User } from "@platform/entities";
import { BudgetsService } from "./budgets.service";

@Controller("budgets")
@UseGuards(PermissionGuard)
@RequirePermission("finance")
export class BudgetsController {
  constructor(
    @Inject(BudgetsService)
    private readonly service: BudgetsService
  ) {}

  /** 편성 + 집행 현황 */
  @Get()
  status(@Query("year") year?: string) {
    return this.service.status(year ? parseInt(year) : new Date().getFullYear());
  }

  /** 편성 일괄 저장 — 승인 권한자 전용 */
  @Put()
  @RequirePermission("finance_approve", { defaultDeny: true })
  async save(
    @Body() body: { year: number; entries: Array<{ accountId: number; amount: number }> },
    @CurrentUser() user: User
  ) {
    await this.service.save(body.year, body.entries, user.id);
    return { success: true };
  }
}
