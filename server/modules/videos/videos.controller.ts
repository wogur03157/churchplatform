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
import { VideosService } from "./videos.service";
import { extractYoutubeVideoId, fetchYoutubeSnippet, parseSermonDescription } from "./youtube-info";

@Controller("videos")
export class VideosController {
  constructor(
    @Inject(VideosService)
    private readonly service: VideosService,
    @Inject(StorageService)
    private readonly storageService: StorageService
  ) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  findAll(
    @Query("publishedOnly") publishedOnly?: string,
    @Query("category") category?: string,
  ) {
    return this.service.findAll(publishedOnly === "true", category);
  }

  @Get(":id")
  @UseGuards(OptionalAuthGuard)
  async findOne(@Param("id", ParseIntPipe) id: number) {
    const item = await this.service.findOne(id);
    if (!item) throw new HttpException("Not found", HttpStatus.NOT_FOUND);
    return item;
  }

  /** 유튜브 URL로 제목·설교 날짜·본문을 가져옵니다 (YouTube Data API 키 필요) */
  @Post("youtube-info")
  @UseGuards(AdminGuard)
  async youtubeInfo(@Body() body: { url: string }) {
    const videoId = extractYoutubeVideoId(body.url ?? "");
    if (!videoId) {
      throw new HttpException("유튜브 주소를 확인해 주세요.", HttpStatus.BAD_REQUEST);
    }
    try {
      const snippet = await fetchYoutubeSnippet(videoId);
      const parsed = parseSermonDescription(snippet.description, snippet.publishedAt);
      return {
        title: parsed.title ?? snippet.youtubeTitle,
        sermonDate: parsed.sermonDate,
        scripture: parsed.scripture,
        preacher: parsed.preacher,
        thumbnailUrl: snippet.thumbnailUrl,
        description: snippet.description,
      };
    } catch (e) {
      throw new HttpException((e as Error).message, HttpStatus.BAD_GATEWAY);
    }
  }

  @Post()
  @UseGuards(AdminGuard)
  async create(
    @Body()
    body: {
      title: string;
      description?: string;
      videoType: "upload" | "youtube" | "vimeo" | "url";
      url: string;
      fileKey?: string;
      thumbnailUrl?: string;
      mimeType?: string;
      fileSize?: number;
      duration?: number;
      status?: "published" | "draft";
      displayOrder?: number;
      category?: string | null;
      sermonDate?: string | null;
      scripture?: string | null;
      preacher?: string | null;
    },
    @CurrentUser() user: User
  ) {
    const result = await this.service.create({
      sermonDate: body.sermonDate ?? null,
      scripture: body.scripture ?? null,
      preacher: body.preacher ?? null,
      title: body.title,
      description: body.description,
      videoType: body.videoType,
      url: body.url,
      fileKey: body.fileKey,
      thumbnailUrl: body.thumbnailUrl,
      mimeType: body.mimeType,
      fileSize: body.fileSize,
      duration: body.duration,
      uploadedBy: user.id,
      status: body.status ?? "draft",
      displayOrder: body.displayOrder ?? 0,
      category: body.category ?? null,
    });
    return { success: true, id: result.id };
  }

  @Post("upload-file")
  @UseGuards(AdminGuard)
  async uploadFile(
    @Body() body: { fileData: string; mimeType: string; fileSize: number },
    @CurrentUser() user: User
  ) {
    const buffer = Buffer.from(body.fileData, "base64");
    const ext = body.mimeType.split("/")[1] ?? "bin";
    const fileKey = `videos/${user.id}/${nanoid()}.${ext}`;
    const { url } = await this.storageService.put(
      fileKey,
      buffer,
      body.mimeType
    );
    return { success: true, url, fileKey };
  }

  @Patch(":id")
  @UseGuards(AdminGuard)
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body()
    body: {
      title?: string;
      description?: string;
      url?: string;
      thumbnailUrl?: string;
      status?: "published" | "draft";
      displayOrder?: number;
      category?: string | null;
      sermonDate?: string | null;
      scripture?: string | null;
      preacher?: string | null;
    }
  ) {
    const updateData: Record<string, unknown> = {};
    if (body.preacher !== undefined) updateData.preacher = body.preacher;
    if (body.sermonDate !== undefined) updateData.sermonDate = body.sermonDate;
    if (body.scripture !== undefined) updateData.scripture = body.scripture;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.url !== undefined) updateData.url = body.url;
    if (body.thumbnailUrl !== undefined) updateData.thumbnailUrl = body.thumbnailUrl;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.displayOrder !== undefined)
      updateData.displayOrder = body.displayOrder;
    if (body.category !== undefined) updateData.category = body.category;

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
