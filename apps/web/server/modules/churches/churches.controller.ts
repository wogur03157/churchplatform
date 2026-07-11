import {
  Body, Controller, Delete, Get, HttpCode, Inject, Param, ParseIntPipe,
  Patch, Post, Query, UseGuards,
} from "@nestjs/common";
import { ChurchesService } from "./churches.service";
import { ApplyChurchDto } from "./dto/apply-church.dto";
import { ReviewChurchDto } from "./dto/review-church.dto";
import { UpdateChurchDto } from "./dto/update-church.dto";
import { OptionalAuthGuard } from "@platform/auth";
import { AdminGuard } from "@platform/auth";
import { SuperAdminGuard } from "@platform/auth";
import { CurrentUser } from "@platform/auth";
import { User } from "@platform/entities";

@Controller("churches")
@UseGuards(OptionalAuthGuard)
export class ChurchesController {
  constructor(
    @Inject(ChurchesService)
    private readonly churchesService: ChurchesService,
  ) {}

  // ── 공개 ──────────────────────────────────────────────────────────────────

  /** 교회 slug 조회 (공개 페이지용) */
  @Get("slug/:slug")
  findBySlug(@Param("slug") slug: string) {
    return this.churchesService.findBySlug(slug);
  }

  // ── 신청 (로그인 필요) ─────────────────────────────────────────────────────

  /** POST /api/churches/apply */
  @Post("apply")
  @UseGuards(AdminGuard)
  apply(@Body() dto: ApplyChurchDto, @CurrentUser() user: User) {
    return this.churchesService.apply(dto, user.id);
  }

  // ── 내 교회 (church_admin) ─────────────────────────────────────────────────

  /** GET /api/churches/my — 내가 관리하는 교회 목록 */
  @Get("my")
  @UseGuards(AdminGuard)
  myChurches(@CurrentUser() user: User) {
    return this.churchesService.findByAdmin(user.id);
  }

  /** GET /api/churches/my/features — 내 교회 기능 목록 */
  @Get("my/features")
  @UseGuards(AdminGuard)
  async myFeatures(@CurrentUser() user: User) {
    const churches = await this.churchesService.findByAdmin(user.id);
    if (churches.length === 0) return [];
    return this.churchesService.getFeatures(churches[0].id);
  }

  // ── 최고관리자 ─────────────────────────────────────────────────────────────

  /** GET /api/churches?status=pending */
  @Get()
  @UseGuards(SuperAdminGuard)
  findAll(@Query("status") status?: string) {
    return this.churchesService.findAll(status);
  }

  @Get(":id")
  @UseGuards(SuperAdminGuard)
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.churchesService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(SuperAdminGuard)
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateChurchDto) {
    return this.churchesService.update(id, dto);
  }

  /** POST /api/churches/:id/review — 승인 or 거절 */
  @Post(":id/review")
  @HttpCode(200)
  @UseGuards(SuperAdminGuard)
  review(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ReviewChurchDto,
    @CurrentUser() user: User,
  ) {
    return this.churchesService.review(id, dto, user.id);
  }

  /** GET /api/churches/:id/admins */
  @Get(":id/admins")
  @UseGuards(SuperAdminGuard)
  getAdmins(@Param("id", ParseIntPipe) id: number) {
    return this.churchesService.getAdmins(id);
  }

  /** POST /api/churches/:id/admins/:userId */
  @Post(":id/admins/:userId")
  @HttpCode(200)
  @UseGuards(SuperAdminGuard)
  addAdmin(
    @Param("id", ParseIntPipe) id: number,
    @Param("userId", ParseIntPipe) userId: number,
  ) {
    return this.churchesService.addAdmin(id, userId);
  }

  /** DELETE /api/churches/:id/admins/:userId */
  @Delete(":id/admins/:userId")
  @UseGuards(SuperAdminGuard)
  removeAdmin(
    @Param("id", ParseIntPipe) id: number,
    @Param("userId", ParseIntPipe) userId: number,
  ) {
    return this.churchesService.removeAdmin(id, userId);
  }

  /** GET /api/churches/:id/features */
  @Get(":id/features")
  @UseGuards(SuperAdminGuard)
  getFeatures(@Param("id", ParseIntPipe) id: number) {
    return this.churchesService.getFeatures(id);
  }

  /** PATCH /api/churches/:id/features/:featureKey */
  @Patch(":id/features/:featureKey")
  @UseGuards(SuperAdminGuard)
  setFeature(
    @Param("id", ParseIntPipe) id: number,
    @Param("featureKey") featureKey: string,
    @Body("isEnabled") isEnabled: boolean,
    @CurrentUser() user: User,
  ) {
    return this.churchesService.setFeature(id, featureKey, isEnabled, user.id);
  }
}
