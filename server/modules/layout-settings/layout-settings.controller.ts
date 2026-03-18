import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AdminGuard } from "../auth/guards/admin.guard";
import { OptionalAuthGuard } from "../auth/guards/optional-auth.guard";
import type { User } from "../users/entities/user.entity";
import { LayoutSettingsService } from "./layout-settings.service";
import { ChurchesService } from "../churches/churches.service";

@Controller("layout-settings")
export class LayoutSettingsController {
  constructor(
    @Inject(LayoutSettingsService)
    private readonly service: LayoutSettingsService,
    @Inject(ChurchesService)
    private readonly churchesService: ChurchesService,
  ) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  async findAll(@CurrentUser() user: User | null) {
    let churchId: number | undefined;
    
    if (user) {
      if (user.role === "super_admin") {
        // 슈퍼 어드민은 기본적으로 1번 교회를 보거나, 별도 파라미터가 필요함 (일단 1번)
        churchId = 1;
      } else {
        const churches = await this.churchesService.findByAdmin(user.id);
        if (churches.length > 0) churchId = churches[0].id;
      }
    } else {
      // 비로그인 공개 페이지: 기본적으로 1번 교회 설정을 보여줌
      churchId = 1;
    }
    
    return this.service.findAll(churchId);
  }

  private async getChurchIdForAdmin(user: User): Promise<number> {
    if (user.role === "super_admin") return 1; // 슈퍼 어드민 기본 교회
    const churches = await this.churchesService.findByAdmin(user.id);
    if (churches.length === 0) throw new ForbiddenException("소속된 교회가 없습니다");
    return churches[0].id;
  }

  @Post("save-all")
  @UseGuards(AdminGuard)
  async saveAll(
    @Body()
    body: Array<{
      sectionType: "announcements" | "images" | "videos" | "hero" | "image_a" | "image_b";
      status: "visible" | "hidden";
      displayOrder: number;
      colSpan: number;
      title?: string;
      subtitle?: string;
      imageKey?: string;
      imageUrl?: string;
    }>,
    @CurrentUser() user: User,
  ) {
    const churchId = await this.getChurchIdForAdmin(user);
    await this.service.saveAll(
      body.map((item) => ({
        sectionType: item.sectionType,
        status: item.status,
        displayOrder: item.displayOrder,
        colSpan: item.colSpan ?? 1,
        title: item.title,
        subtitle: item.subtitle,
        imageKey: item.imageKey,
        imageUrl: item.imageUrl,
      })),
      churchId,
      user.id,
    );
    return { success: true };
  }

  @Post("upsert")
  @UseGuards(AdminGuard)
  async upsert(
    @Body()
    body: {
      sectionType: "announcements" | "images" | "videos" | "hero" | "image_a" | "image_b";
      status: "visible" | "hidden";
      displayOrder: number;
      colSpan?: number;
      title?: string;
      subtitle?: string;
      imageKey?: string;
      imageUrl?: string;
    },
    @CurrentUser() user: User
  ) {
    const churchId = await this.getChurchIdForAdmin(user);
    await this.service.upsert({
      sectionType: body.sectionType,
      status: body.status,
      displayOrder: body.displayOrder,
      colSpan: body.colSpan ?? 1,
      title: body.title,
      subtitle: body.subtitle,
      imageKey: body.imageKey,
      imageUrl: body.imageUrl,
      churchId,
      updatedBy: user.id,
    });
    return { success: true };
  }

  @Patch(":id")
  @UseGuards(AdminGuard)
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body()
    body: {
      status?: "visible" | "hidden";
      displayOrder?: number;
      colSpan?: number;
      title?: string;
      subtitle?: string;
    },
    @CurrentUser() user: User
  ) {
    const updateData: Record<string, unknown> = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.displayOrder !== undefined) updateData.displayOrder = body.displayOrder;
    if (body.colSpan !== undefined) updateData.colSpan = body.colSpan;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
    updateData.updatedBy = user.id;

    await this.service.update(id, updateData);
    return { success: true };
  }
}
