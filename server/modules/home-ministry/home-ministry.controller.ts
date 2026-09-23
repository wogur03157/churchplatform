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
import { HomeMinistryService } from "./home-ministry.service";

@Controller("home-ministry")
export class HomeMinistryController {
  constructor(@Inject(HomeMinistryService) private readonly service: HomeMinistryService) {}

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
