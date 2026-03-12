import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { PageGroupsService } from "./page-groups.service";
import { OptionalAuthGuard } from "../auth/guards/optional-auth.guard";

@Controller("page-groups")
@UseGuards(OptionalAuthGuard)
export class PageGroupsController {
  constructor(private readonly service: PageGroupsService) {}

  @Get() findAll(@Query("groupKey") groupKey?: string) { return this.service.findAll(groupKey); }
  @Get(":id") findOne(@Param("id", ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() body: any) { return this.service.create(body); }
  @Patch(":id") update(@Param("id", ParseIntPipe) id: number, @Body() body: any) { return this.service.update(id, body); }
  @Delete(":id") remove(@Param("id", ParseIntPipe) id: number) { return this.service.remove(id); }
}
