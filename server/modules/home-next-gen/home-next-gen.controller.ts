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
import { HomeNextGenService } from "./home-next-gen.service";

@Controller("home-next-gen")
export class HomeNextGenController {
  constructor(@Inject(HomeNextGenService) private readonly service: HomeNextGenService) {}

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
