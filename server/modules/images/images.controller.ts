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
import { nanoid } from "nanoid";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AdminGuard } from "../auth/guards/admin.guard";
import { OptionalAuthGuard } from "../auth/guards/optional-auth.guard";
import { StorageService } from "../storage/storage.service";
import type { User } from "../users/entities/user.entity";
import { ImagesService } from "./images.service";

@Controller("images")
export class ImagesController {
  constructor(
    @Inject(ImagesService)
    private readonly service: ImagesService,
    @Inject(StorageService)
    private readonly storageService: StorageService
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
  async upload(
    @Body()
    body: {
      title: string;
      description?: string;
      fileData: string;
      mimeType: string;
      fileSize: number;
      status?: "published" | "draft";
      displayOrder?: number;
    },
    @CurrentUser() user: User
  ) {
    const buffer = Buffer.from(body.fileData, "base64");
    const ext = body.mimeType.split("/")[1] ?? "bin";
    const fileKey = `images/${user.id}/${nanoid()}.${ext}`;
    const { url } = await this.storageService.put(
      fileKey,
      buffer,
      body.mimeType
    );

    const result = await this.service.create({
      title: body.title,
      description: body.description,
      fileKey,
      url,
      mimeType: body.mimeType,
      fileSize: body.fileSize,
      uploadedBy: user.id,
      status: body.status ?? "draft",
      displayOrder: body.displayOrder ?? 0,
    });

    return { success: true, id: result.id, url };
  }

  @Patch(":id")
  @UseGuards(AdminGuard)
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body()
    body: {
      title?: string;
      description?: string;
      status?: "published" | "draft";
      displayOrder?: number;
    }
  ) {
    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.displayOrder !== undefined)
      updateData.displayOrder = body.displayOrder;

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
