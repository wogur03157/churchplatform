import {
  BadRequestException,
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
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { CurrentUser, PermissionGuard, RequirePermission } from "@platform/auth";
import type { User } from "@platform/entities";
import { MemberExcelService } from "./member-excel.service";
import type { Member } from "./member.entity";
import { MembersService } from "./members.service";

/**
 * 교인 CRUD — GET/POST /api/members, GET/PATCH/DELETE /api/members/:id
 * (:id는 숫자만 매칭 — /api/members/families 등 하위 리소스와 충돌 방지)
 */
@Controller()
@UseGuards(PermissionGuard)
@RequirePermission("members")
export class MembersController {
  constructor(
    @Inject(MembersService)
    private readonly service: MembersService,
    @Inject(MemberExcelService)
    private readonly excel: MemberExcelService
  ) {}

  /** 엑셀 일괄 등록 — body: { fileBase64 } (xlsx/csv) */
  @Post("import")
  importExcel(@Body() body: { fileBase64?: string }, @CurrentUser() user: User) {
    if (!body.fileBase64) throw new BadRequestException("fileBase64가 필요합니다");
    return this.excel.import(body.fileBase64, user.id);
  }

  /** 전체 명단 엑셀 다운로드 */
  @Get("export")
  async exportExcel(@CurrentUser() user: User, @Res() res: Response) {
    const buffer = await this.excel.export(user.id);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", 'attachment; filename="members.xlsx"');
    res.send(buffer);
  }

  @Get()
  findAll(
    @Query("query") query?: string,
    @Query("status") status?: Member["status"],
    @Query("positionId") positionId?: string,
    @Query("baptismLevel") baptismLevel?: Member["baptismLevel"],
    @Query("familyId") familyId?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    return this.service.findAll({
      query,
      status,
      baptismLevel,
      positionId: positionId ? parseInt(positionId) : undefined,
      familyId: familyId ? parseInt(familyId) : undefined,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(":id(\\d+)")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() body: Partial<Member>, @CurrentUser() user: User) {
    const member = await this.service.create(body, user.id);
    return { success: true, id: member.id };
  }

  @Patch(":id(\\d+)")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: Partial<Member>,
    @CurrentUser() user: User
  ) {
    await this.service.update(id, body, user.id);
    return { success: true };
  }

  @Delete(":id(\\d+)")
  async remove(@Param("id", ParseIntPipe) id: number, @CurrentUser() user: User) {
    await this.service.remove(id, user.id);
    return { success: true };
  }
}
