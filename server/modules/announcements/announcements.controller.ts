import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AdminGuard } from "../auth/guards/admin.guard";
import { OptionalAuthGuard } from "../auth/guards/optional-auth.guard";
import type { User } from "../users/entities/user.entity";
import { AnnouncementsService } from "./announcements.service";

@Controller("announcements")
export class AnnouncementsController {
  constructor(
    @Inject(AnnouncementsService)
    private readonly service: AnnouncementsService
  ) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  findAll(@Query("publishedOnly") publishedOnly?: string) {
    return this.service.findAll(publishedOnly === "true");
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
    @Body()
    body: {
      title: string;
      content: string;
      isPublished?: boolean;
    },
    @CurrentUser() user: User
  ) {
    const result = await this.service.create({
      title: body.title,
      content: body.content,
      authorId: user.id,
      isPublished: body.isPublished ? 1 : 0,
      publishedAt: body.isPublished ? new Date() : undefined,
    });
    return { success: true, id: result.id };
  }

  @Patch(":id")
  @UseGuards(AdminGuard)
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body()
    body: {
      title?: string;
      content?: string;
      isPublished?: boolean;
    }
  ) {
    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.isPublished !== undefined) {
      updateData.isPublished = body.isPublished ? 1 : 0;
      if (body.isPublished) updateData.publishedAt = new Date();
    }
    await this.service.update(id, updateData as any);
    return { success: true };
  }

  @Delete(":id")
  @UseGuards(AdminGuard)
  async remove(@Param("id", ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { success: true };
  }
}
