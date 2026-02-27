import {
  Body, Controller, Delete, Get, HttpException, HttpStatus,
  Inject, Param, ParseIntPipe, Patch, Post, Query, UseGuards,
} from "@nestjs/common";
import { nanoid } from "nanoid";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AdminGuard } from "../auth/guards/admin.guard";
import { OptionalAuthGuard } from "../auth/guards/optional-auth.guard";
import { StorageService } from "../storage/storage.service";
import type { User } from "../users/entities/user.entity";
import { PopupsService } from "./popups.service";

@Controller("popups")
export class PopupsController {
  constructor(
    @Inject(PopupsService) private readonly service: PopupsService,
    @Inject(StorageService) private readonly storageService: StorageService,
  ) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  findAll(@Query("activeOnly") activeOnly?: string) {
    return this.service.findAll(activeOnly === "true");
  }

  @Get(":id")
  @UseGuards(OptionalAuthGuard)
  async findOne(@Param("id", ParseIntPipe) id: number) {
    const item = await this.service.findOne(id);
    if (!item) throw new HttpException("Not found", HttpStatus.NOT_FOUND);
    return item;
  }

  @Post()
  @UseGuards(AdminGuard)
  async create(
    @Body() body: {
      title: string;
      linkUrl?: string;
      startDate?: string;
      endDate?: string;
      isActive?: boolean;
      fileData?: string;
      mimeType?: string;
      fileSize?: number;
    },
    @CurrentUser() user: User,
  ) {
    let imageKey: string | undefined;
    let imageUrl: string | undefined;

    if (body.fileData && body.mimeType) {
      const buffer = Buffer.from(body.fileData, "base64");
      const ext = body.mimeType.split("/")[1] ?? "bin";
      imageKey = `popups/${user.id}/${nanoid()}.${ext}`;
      const result = await this.storageService.put(imageKey, buffer, body.mimeType);
      imageUrl = result.url;
    }

    const popup = await this.service.create({
      title: body.title,
      imageKey: imageKey ?? null,
      imageUrl: imageUrl ?? null,
      linkUrl: body.linkUrl ?? null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      isActive: body.isActive ? 1 : 0,
      createdBy: user.id,
      churchId: null,
    });

    return { success: true, id: popup.id, imageUrl };
  }

  @Patch(":id")
  @UseGuards(AdminGuard)
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: {
      title?: string;
      linkUrl?: string;
      startDate?: string;
      endDate?: string;
      isActive?: boolean;
      fileData?: string;
      mimeType?: string;
    },
    @CurrentUser() user: User,
  ) {
    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.linkUrl !== undefined) data.linkUrl = body.linkUrl || null;
    if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.isActive !== undefined) data.isActive = body.isActive ? 1 : 0;

    if (body.fileData && body.mimeType) {
      const buffer = Buffer.from(body.fileData, "base64");
      const ext = body.mimeType.split("/")[1] ?? "bin";
      const imageKey = `popups/${user.id}/${nanoid()}.${ext}`;
      const result = await this.storageService.put(imageKey, buffer, body.mimeType);
      data.imageKey = imageKey;
      data.imageUrl = result.url;
    }

    await this.service.update(id, data as any);
    return { success: true };
  }

  @Delete(":id")
  @UseGuards(AdminGuard)
  async remove(@Param("id", ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { success: true };
  }
}
