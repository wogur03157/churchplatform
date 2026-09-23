import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { HomeWorshipService } from "./home-worship.service";

@Controller("home-worship")
export class HomeWorshipController {
  constructor(@Inject(HomeWorshipService) private readonly service: HomeWorshipService) {}

  @Get()
  findAll(@Query("churchId") churchId?: string) {
    return this.service.findAll(
      churchId !== undefined ? Number(churchId) : undefined,
    );
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.service.findOne(Number(id));
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: any) {
    return this.service.update(Number(id), body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(Number(id));
  }
}
