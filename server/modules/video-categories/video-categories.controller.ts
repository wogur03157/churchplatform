import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { AdminGuard } from "../auth/guards/admin.guard";
import { VideoCategoriesService } from "./video-categories.service";
import { OptionalAuthGuard } from "../auth/guards/optional-auth.guard";

@Controller("video-categories")
@UseGuards(OptionalAuthGuard)
export class VideoCategoriesController {
  constructor(@Inject(VideoCategoriesService) private readonly service: VideoCategoriesService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get(":id") findOne(@Param("id", ParseIntPipe) id: number) { return this.service.findOne(id); }
  @UseGuards(AdminGuard)
  @Post() create(@Body() body: any) { return this.service.create(body); }
  @UseGuards(AdminGuard)
  @Patch(":id") update(@Param("id", ParseIntPipe) id: number, @Body() body: any) { return this.service.update(id, body); }
  @UseGuards(AdminGuard)
  @Delete(":id") remove(@Param("id", ParseIntPipe) id: number) { return this.service.remove(id); }
}
