import { Body, Controller, Get, Inject, Patch, Query } from "@nestjs/common";
import { HomeCanaanService } from "./home-canaan.service";

@Controller("home-canaan")
export class HomeCanaanController {
  constructor(@Inject(HomeCanaanService) private readonly service: HomeCanaanService) {}

  @Get()
  findOne(@Query("churchId") churchId?: string) {
    return this.service.findOne(
      churchId !== undefined ? Number(churchId) : undefined,
    );
  }

  @Patch()
  upsert(@Body() body: any) {
    return this.service.upsert(body);
  }
}
