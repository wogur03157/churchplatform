import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  CurrentUser,
  PermissionGuard,
  PermissionsService,
  RequirePermission,
} from "@platform/auth";
import type { User } from "@platform/entities";
import type { Visitation, VisitationStatus } from "./care.entities";
import { VisitationsService } from "./visitations.service";

const SENSITIVE_PERM = "members_sensitive";

/**
 * 심방 — 요청/배정/일정은 members 권한,
 * 수행 기록(content)은 members_sensitive(allow-list)로 필드 단위 분리.
 */
@Controller("visitations")
@UseGuards(PermissionGuard)
@RequirePermission("members")
export class VisitationsController {
  constructor(
    @Inject(VisitationsService)
    private readonly service: VisitationsService,
    @Inject(PermissionsService)
    private readonly permissions: PermissionsService
  ) {}

  @Get()
  async findAll(
    @CurrentUser() user: User,
    @Query("status") status?: VisitationStatus,
    @Query("memberId") memberId?: string,
    @Query("assignedTo") assignedTo?: string
  ) {
    const canReadContent = await this.permissions.checkForUser(user, SENSITIVE_PERM, {
      defaultDeny: true,
    });
    return this.service.findAll(
      {
        status,
        memberId: memberId ? parseInt(memberId) : undefined,
        assignedTo: assignedTo ? parseInt(assignedTo) : undefined,
      },
      canReadContent
    );
  }

  @Post()
  async create(
    @Body()
    body: { memberId: number; type?: Visitation["type"]; scheduledAt?: string; reason?: string },
    @CurrentUser() user: User
  ) {
    const visitation = await this.service.create(
      {
        memberId: body.memberId,
        type: body.type ?? "regular",
        scheduledAt: body.scheduledAt ?? null,
        reason: body.reason ?? null,
      },
      user.id
    );
    return { success: true, id: visitation.id };
  }

  @Patch(":id(\\d+)")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body()
    body: Partial<
      Pick<Visitation, "assignedTo" | "status" | "scheduledAt" | "type" | "reason" | "content">
    >,
    @CurrentUser() user: User
  ) {
    // 심방 기록(content)은 민감 권한자만 작성 가능
    if (body.content !== undefined) {
      const canWrite = await this.permissions.checkForUser(user, SENSITIVE_PERM, {
        defaultDeny: true,
      });
      if (!canWrite) throw new ForbiddenException("심방 기록은 교역자 권한이 필요합니다");
    }
    await this.service.update(id, body, user.id);
    return { success: true };
  }
}
