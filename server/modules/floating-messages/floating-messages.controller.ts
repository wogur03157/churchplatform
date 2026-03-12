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
import { FloatingMessagesService } from "./floating-messages.service";

@Controller("floating-messages")
export class FloatingMessagesController {
  constructor(
    @Inject(FloatingMessagesService)
    private readonly service: FloatingMessagesService
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
    @Body()
    body: {
      title: string;
      content: string;
      messageType?: "info" | "warning" | "success" | "announcement";
      status?: "active" | "inactive";
      startDate?: string;
      endDate?: string;
      displayPosition?: "top" | "bottom" | "center";
    },
    @CurrentUser() user: User
  ) {
    const result = await this.service.create({
      title: body.title,
      content: body.content,
      messageType: body.messageType ?? "info",
      status: body.status ?? "inactive",
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      displayPosition: body.displayPosition ?? "center",
      createdBy: user.id,
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
      messageType?: "info" | "warning" | "success" | "announcement";
      status?: "active" | "inactive";
      startDate?: string;
      endDate?: string;
      displayPosition?: "top" | "bottom" | "center";
    }
  ) {
    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.messageType !== undefined) updateData.messageType = body.messageType;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.startDate !== undefined)
      updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined)
      updateData.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.displayPosition !== undefined)
      updateData.displayPosition = body.displayPosition;

    await this.service.update(id, updateData);
    return { success: true };
  }

  @Delete(":id")
  @UseGuards(AdminGuard)
  async remove(@Param("id", ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { success: true };
  }
}
