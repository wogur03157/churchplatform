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
import { Position } from "./position.entity";
import { PositionsService } from "./positions.service";

@Controller("positions")
@UseGuards(PermissionGuard)
@RequirePermission("members")
export class PositionsController {
  constructor(
    @Inject(PositionsService)
    private readonly service: PositionsService
  ) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  async create(@Body() body: { name: string; displayOrder?: number }) {
    const position = await this.service.create(body);
    return { success: true, id: position.id };
  }

  @Patch(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: Partial<Pick<Position, "name" | "displayOrder">>
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
