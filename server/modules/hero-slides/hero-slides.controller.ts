import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { AdminGuard } from "../auth/guards/admin.guard";
import { OptionalAuthGuard } from "../auth/guards/optional-auth.guard";
import { HeroSlidesService } from "./hero-slides.service";

@Controller("hero-slides")
export class HeroSlidesController {
  constructor(@Inject(HeroSlidesService) private readonly service: HeroSlidesService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  findAll(@Query("all") all?: string) {
    return this.service.findAll(all !== "true");
  }

  @Get("all")
  @UseGuards(AdminGuard)
  findAllAdmin() {
    return this.service.findAll(false);
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(":id")
  @UseGuards(AdminGuard)
  update(@Param("id", ParseIntPipe) id: number, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(":id")
  @UseGuards(AdminGuard)
  async remove(@Param("id", ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { success: true };
  }
}
