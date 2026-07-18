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
import type { Offering } from "./offerings.entities";
import { OfferingInput, OfferingsService } from "./offerings.service";

@Controller()
@UseGuards(PermissionGuard)
@RequirePermission("finance")
export class OfferingsController {
  constructor(
    @Inject(OfferingsService)
    private readonly service: OfferingsService
  ) {}

  // ── 계수 세션 ─────────────────────────────────────────────────
  @Get("offering-batches")
  findBatches() {
    return this.service.findBatches();
  }

  @Post("offering-batches")
  async startBatch(
    @Body() body: { date: string; serviceType: string; counters?: string[] },
    @CurrentUser() user: User
  ) {
    const batch = await this.service.startBatch(body, user.id);
    return { success: true, id: batch.id };
  }

  @Post("offering-batches/:id/confirm")
  confirmBatch(@Param("id", ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.service.confirmBatch(id, user.id);
  }

  /** 계수 세션 폐기 (확정 전만) */
  @Delete("offering-batches/:id(\\d+)")
  async discardBatch(@Param("id", ParseIntPipe) id: number, @CurrentUser() user: User) {
    await this.service.discardBatch(id, user.id);
    return { success: true };
  }

  /** 계수표 — 종류별/방법별 합계 */
  @Get("offering-batches/:id/sheet")
  batchSheet(@Param("id", ParseIntPipe) id: number) {
    return this.service.batchSheet(id);
  }

  // ── 헌금 기록 ─────────────────────────────────────────────────
  @Post("offerings")
  async create(@Body() body: OfferingInput, @CurrentUser() user: User) {
    const offering = await this.service.create(body, user.id);
    return { success: true, id: offering.id };
  }

  @Post("offerings/:id/void")
  async void(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { reason: string },
    @CurrentUser() user: User
  ) {
    await this.service.void(id, body.reason, user.id);
    return { success: true };
  }

  @Get("offerings")
  findAll(
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("accountId") accountId?: string,
    @Query("memberId") memberId?: string,
    @Query("batchId") batchId?: string,
    @Query("includeVoided") includeVoided?: string
  ): Promise<Offering[]> {
    return this.service.findAll({
      from,
      to,
      accountId: accountId ? parseInt(accountId) : undefined,
      memberId: memberId ? parseInt(memberId) : undefined,
      batchId: batchId ? parseInt(batchId) : undefined,
      includeVoided: includeVoided === "true",
    });
  }

  /** 기간 수입 집계 (주보·월간 보고) */
  @Get("offerings/summary")
  summary(@Query("from") from: string, @Query("to") to: string) {
    return this.service.summary(from, to);
  }
}
