import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { CurrentUser, PermissionGuard, RequirePermission } from "@platform/auth";
import type { User } from "@platform/entities";
import type { ExpenseStatus } from "./expenses.entities";
import { ExpensesService } from "./expenses.service";

/**
 * 지출결의 — 기안/조회/지급/첨부는 finance,
 * 승인/반려는 finance_approve(allow-list, 재정부장·담임 전용).
 */
@Controller("expenses")
@UseGuards(PermissionGuard)
@RequirePermission("finance")
export class ExpensesController {
  constructor(
    @Inject(ExpensesService)
    private readonly service: ExpensesService
  ) {}

  @Get()
  findAll(
    @Query("status") status?: ExpenseStatus,
    @Query("departmentId") departmentId?: string,
    @Query("from") from?: string,
    @Query("to") to?: string
  ) {
    return this.service.findAll({
      status,
      departmentId: departmentId ? parseInt(departmentId) : undefined,
      from,
      to,
    });
  }

  /** 기간 지출 집계 (지급 완료 기준) */
  @Get("summary")
  summary(@Query("from") from: string, @Query("to") to: string) {
    return this.service.summary(from, to);
  }

  @Post()
  async create(
    @Body()
    body: {
      departmentId: number;
      accountId: number;
      amount: number;
      title: string;
      description?: string;
    },
    @CurrentUser() user: User
  ) {
    const expense = await this.service.create(body, user.id);
    return {
      success: true,
      id: expense.id,
      requestNo: expense.requestNo,
      budgetWarning: expense.budgetWarning ?? null,
    };
  }

  @Post(":id(\\d+)/approve")
  @RequirePermission("finance_approve", { defaultDeny: true })
  async approve(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { comment?: string },
    @CurrentUser() user: User
  ) {
    await this.service.review(id, "approve", body.comment ?? null, user.id);
    return { success: true };
  }

  @Post(":id(\\d+)/reject")
  @RequirePermission("finance_approve", { defaultDeny: true })
  async reject(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { comment: string },
    @CurrentUser() user: User
  ) {
    await this.service.review(id, "reject", body.comment, user.id);
    return { success: true };
  }

  @Post(":id(\\d+)/pay")
  async pay(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { paidAt: string; paidMethod: "cash" | "transfer" | "card" },
    @CurrentUser() user: User
  ) {
    await this.service.pay(id, body, user.id);
    return { success: true };
  }

  @Post(":id(\\d+)/void")
  async void(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { reason: string },
    @CurrentUser() user: User
  ) {
    await this.service.void(id, body.reason, user.id);
    return { success: true };
  }

  @Get(":id(\\d+)/attachments")
  findAttachments(@Param("id", ParseIntPipe) id: number) {
    return this.service.findAttachments(id);
  }

  @Post(":id(\\d+)/attachments")
  async addAttachment(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { fileBase64: string; fileName: string; mimeType?: string },
    @CurrentUser() user: User,
    @Req() req: Request
  ) {
    const attachment = await this.service.addAttachment(id, body, user.id, req.church?.slug);
    return { success: true, id: attachment.id, fileKey: attachment.fileKey };
  }

  /** 첨부 다운로드 — 인증 + 자기 교회 파일만 (비인증 정적 서빙 대체) */
  @Get("attachments/:attachmentId(\\d+)/download")
  async downloadAttachment(
    @Param("attachmentId", ParseIntPipe) attachmentId: number,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const file = await this.service.getAttachmentFile(attachmentId, req.church?.slug);
    if (file.mimeType) res.setHeader("Content-Type", file.mimeType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename*=UTF-8''${encodeURIComponent(file.fileName)}`
    );
    res.sendFile(file.path);
  }
}
