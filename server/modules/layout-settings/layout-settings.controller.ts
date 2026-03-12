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
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AdminGuard } from "../auth/guards/admin.guard";
import { OptionalAuthGuard } from "../auth/guards/optional-auth.guard";
import type { User } from "../users/entities/user.entity";
import { LayoutSettingsService } from "./layout-settings.service";

@Controller("layout-settings")
export class LayoutSettingsController {
  constructor(
    @Inject(LayoutSettingsService)
    private readonly service: LayoutSettingsService
  ) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  findAll() {
    return this.service.findAll();
  }

  @Post("save-all")
  @UseGuards(AdminGuard)
  async saveAll(
    @Body()
    body: Array<{
      sectionType: "announcements" | "images" | "videos" | "hero" | "image_a" | "image_b";
      isVisible: boolean;
      displayOrder: number;
      colSpan: number;
      title?: string;
      subtitle?: string;
      imageKey?: string;
      imageUrl?: string;
    }>,
    @CurrentUser() user: User,
  ) {
    await this.service.saveAll(
      body.map((item) => ({
        sectionType: item.sectionType,
        isVisible: item.isVisible ? 1 : 0,
        displayOrder: item.displayOrder,
        colSpan: item.colSpan ?? 1,
        title: item.title,
        subtitle: item.subtitle,
        imageKey: item.imageKey,
        imageUrl: item.imageUrl,
      })),
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
      isVisible: boolean;
      displayOrder: number;
      colSpan?: number;
      title?: string;
      subtitle?: string;
      imageKey?: string;
      imageUrl?: string;
    },
    @CurrentUser() user: User
  ) {
    await this.service.upsert({
      sectionType: body.sectionType,
      isVisible: body.isVisible ? 1 : 0,
      displayOrder: body.displayOrder,
      colSpan: body.colSpan ?? 1,
      title: body.title,
      subtitle: body.subtitle,
      imageKey: body.imageKey,
      imageUrl: body.imageUrl,
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
      isVisible?: boolean;
      displayOrder?: number;
      colSpan?: number;
      title?: string;
      subtitle?: string;
    },
    @CurrentUser() user: User
  ) {
    const updateData: Record<string, unknown> = {};
    if (body.isVisible !== undefined) updateData.isVisible = body.isVisible ? 1 : 0;
    if (body.displayOrder !== undefined) updateData.displayOrder = body.displayOrder;
    if (body.colSpan !== undefined) updateData.colSpan = body.colSpan;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
    updateData.updatedBy = user.id;

    await this.service.update(id, updateData);
    return { success: true };
  }
}
