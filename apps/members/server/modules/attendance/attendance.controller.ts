import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser, PermissionGuard, RequirePermission } from "@platform/auth";
import type { User } from "@platform/entities";
import type { AttendanceSession } from "./attendance.entity";
import { AttendanceService, CheckPayload } from "./attendance.service";

@Controller("attendance")
@UseGuards(PermissionGuard)
@RequirePermission("members")
export class AttendanceController {
  constructor(
    @Inject(AttendanceService)
    private readonly service: AttendanceService
  ) {}

  // ── 세션 관리 ─────────────────────────────────────────────────
  @Get("sessions")
  findSessions() {
    return this.service.findSessions();
  }

  @Post("sessions")
  async createSession(@Body() body: Partial<AttendanceSession>) {
    const session = await this.service.createSession(body);
    return { success: true, id: session.id };
  }

  @Patch("sessions/:id")
  async updateSession(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: Partial<AttendanceSession>
  ) {
    await this.service.updateSession(id, body);
    return { success: true };
  }

  @Delete("sessions/:id")
  async removeSession(@Param("id", ParseIntPipe) id: number) {
    await this.service.removeSession(id);
    return { success: true };
  }

  // ── 출석 체크/조회 ────────────────────────────────────────────
  @Post("check")
  check(@Body() body: CheckPayload, @CurrentUser() user: User) {
    return this.service.check(body, user.id);
  }

  @Get("records")
  findRecords(
    @Query("sessionId", ParseIntPipe) sessionId: number,
    @Query("date") date: string
  ) {
    return this.service.findRecords(sessionId, date);
  }

  @Get("stats")
  stats(
    @Query("from") from: string,
    @Query("to") to: string,
    @Query("sessionId") sessionId?: string
  ) {
    return this.service.stats(from, to, sessionId ? parseInt(sessionId) : undefined);
  }

  @Get("members/:memberId")
  memberHistory(@Param("memberId", ParseIntPipe) memberId: number) {
    return this.service.findMemberHistory(memberId);
  }
}
