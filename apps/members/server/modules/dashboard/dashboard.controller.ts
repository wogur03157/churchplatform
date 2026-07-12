import { Controller, Get, Inject, Query, UseGuards } from "@nestjs/common";
import { PermissionGuard, RequirePermission } from "@platform/auth";
import { DashboardService } from "./dashboard.service";

@Controller("dashboard")
@UseGuards(PermissionGuard)
@RequirePermission("members")
export class DashboardController {
  constructor(
    @Inject(DashboardService)
    private readonly service: DashboardService
  ) {}

  @Get()
  summary(@Query("absentWeeks") absentWeeks?: string) {
    const weeks = absentWeeks ? Math.max(1, parseInt(absentWeeks)) : 4;
    return this.service.summary(weeks);
  }
}
