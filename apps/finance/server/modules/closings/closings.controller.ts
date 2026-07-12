import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser, PermissionGuard, RequirePermission } from "@platform/auth";
import type { User } from "@platform/entities";
import { ClosingsService } from "./closings.service";

/** 마감 — 잠금/해제는 finance_approve(재정부장·담임) 전용 */
@Controller("closings")
@UseGuards(PermissionGuard)
@RequirePermission("finance")
export class ClosingsController {
  constructor(
    @Inject(ClosingsService)
    private readonly service: ClosingsService
  ) {}

  @Get()
  findByYear(@Query("year") year?: string) {
    return this.service.findByYear(year ? parseInt(year) : new Date().getFullYear());
  }

  @Post()
  @RequirePermission("finance_approve", { defaultDeny: true })
  async lock(
    @Body() body: { year: number; month?: number | null },
    @CurrentUser() user: User
  ) {
    const lock = await this.service.lock(body.year, body.month ?? null, user.id);
    return { success: true, id: lock.id };
  }

  @Delete(":id")
  @RequirePermission("finance_approve", { defaultDeny: true })
  async unlock(@Param("id", ParseIntPipe) id: number, @CurrentUser() user: User) {
    await this.service.unlock(id, user.id);
    return { success: true };
  }
}
