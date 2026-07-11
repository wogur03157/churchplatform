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
  UseGuards,
} from "@nestjs/common";
import { PermissionGuard, RequirePermission } from "@platform/auth";
import { Family } from "./family.entity";
import { FamiliesService } from "./families.service";

@Controller("families")
@UseGuards(PermissionGuard)
@RequirePermission("members")
export class FamiliesController {
  constructor(
    @Inject(FamiliesService)
    private readonly service: FamiliesService
  ) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() body: { label?: string; headMemberId?: number }) {
    const family = await this.service.create(body);
    return { success: true, id: family.id };
  }

  @Patch(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: Partial<Pick<Family, "label" | "headMemberId">>
  ) {
    await this.service.update(id, body);
    return { success: true };
  }

  @Delete(":id")
  async remove(@Param("id", ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { success: true };
  }
}
