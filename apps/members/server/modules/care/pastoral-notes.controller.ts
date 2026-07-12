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
import { PastoralNotesService } from "./pastoral-notes.service";

/**
 * 목양 메모 — 교역자 전용. members_sensitive는 allow-list라
 * admin_permissions에 allowed 행이 있어야만 접근 가능 (super_admin 제외).
 */
@Controller("pastoral-notes")
@UseGuards(PermissionGuard)
@RequirePermission("members_sensitive", { defaultDeny: true })
export class PastoralNotesController {
  constructor(
    @Inject(PastoralNotesService)
    private readonly service: PastoralNotesService
  ) {}

  @Get()
  findByMember(@Query("memberId", ParseIntPipe) memberId: number, @CurrentUser() user: User) {
    return this.service.findByMember(memberId, user.id);
  }

  @Post()
  async create(
    @Body() body: { memberId: number; content: string },
    @CurrentUser() user: User
  ) {
    const note = await this.service.create(body.memberId, body.content, user.id);
    return { success: true, id: note.id };
  }

  @Delete(":id")
  async remove(@Param("id", ParseIntPipe) id: number, @CurrentUser() user: User) {
    await this.service.remove(id, user.id);
    return { success: true };
  }
}
