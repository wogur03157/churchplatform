import {
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
  UseGuards,
} from "@nestjs/common";
import { AdminGuard } from "@platform/auth";
import { OptionalAuthGuard } from "@platform/auth";
import { ContentPagesService } from "./content-pages.service";

@Controller("content-pages")
export class ContentPagesController {
  constructor(
    @Inject(ContentPagesService)
    private readonly service: ContentPagesService
  ) {}

  @Get("categories")
  @UseGuards(OptionalAuthGuard)
  findCategories(@Query("rootSlug") rootSlug?: string) {
    return this.service.findCategories(rootSlug);
  }

  @Get("categories/tree")
  @UseGuards(OptionalAuthGuard)
  findCategoryForest() {
    return this.service.findCategoryForest();
  }

  @Get("categories/tree/:rootSlug")
  @UseGuards(OptionalAuthGuard)
  findCategoryTree(@Param("rootSlug") rootSlug: string) {
    return this.service.findCategoryTree(rootSlug);
  }

  @Post("categories")
  @UseGuards(AdminGuard)
  createCategory(
    @Body()
    body: {
      parentId?: number | null;
      name: string;
      slug: string;
      sortOrder?: number;
      status?: "active" | "hidden";
      templateCode?: "hero" | "gallery" | "board" | "content";
    }
  ) {
    return this.service.createCategory(body);
  }

  @Patch("categories/:id")
  @UseGuards(AdminGuard)
  updateCategory(
    @Param("id", ParseIntPipe) id: number,
    @Body()
    body: {
      parentId?: number | null;
      name?: string;
      slug?: string;
      sortOrder?: number;
      status?: "active" | "hidden";
    }
  ) {
    return this.service.updateCategory(id, body);
  }

  @Delete("categories/:id")
  @UseGuards(AdminGuard)
  removeCategory(@Param("id", ParseIntPipe) id: number) {
    return this.service.removeCategory(id);
  }

  @Get("public/:rootSlug/:slug1/:slug2/:slug3")
  @UseGuards(OptionalAuthGuard)
  findPublicPageDepth3(
    @Param("rootSlug") rootSlug: string,
    @Param("slug1") slug1: string,
    @Param("slug2") slug2: string,
    @Param("slug3") slug3: string,
  ) {
    return this.service.findPublicPage(rootSlug, [slug1, slug2, slug3]);
  }

  @Get("public/:rootSlug/:slug1/:slug2")
  @UseGuards(OptionalAuthGuard)
  findPublicPageDepth2(
    @Param("rootSlug") rootSlug: string,
    @Param("slug1") slug1: string,
    @Param("slug2") slug2: string,
  ) {
    return this.service.findPublicPage(rootSlug, [slug1, slug2]);
  }

  @Get("public/:rootSlug/:slug1")
  @UseGuards(OptionalAuthGuard)
  findPublicPage(
    @Param("rootSlug") rootSlug: string,
    @Param("slug1") slug1: string
  ) {
    return this.service.findPublicPage(rootSlug, [slug1]);
  }

  @Get(":id")
  @UseGuards(OptionalAuthGuard)
  findPage(@Param("id", ParseIntPipe) id: number) {
    return this.service.findPage(id);
  }

  @Patch(":id")
  @UseGuards(AdminGuard)
  updatePage(
    @Param("id", ParseIntPipe) id: number,
    @Body()
    body: {
      title?: string;
      content?: string | null;
      templateCode?: "hero" | "gallery" | "board" | "content";
      status?: "published" | "draft";
      media?: Array<{
        slotKey: string;
        mediaType: "image" | "video";
        url: string;
        thumbnailUrl?: string | null;
        altText?: string | null;
        sortOrder?: number;
      }>;
    }
  ) {
    return this.service.updatePage(id, body);
  }
}
