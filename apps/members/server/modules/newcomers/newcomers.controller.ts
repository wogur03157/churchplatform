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
import type { NewcomerStage } from "./newcomer.entity";
import { NewcomersService } from "./newcomers.service";

@Controller("newcomers")
@UseGuards(PermissionGuard)
@RequirePermission("members")
export class NewcomersController {
  constructor(
    @Inject(NewcomersService)
    private readonly service: NewcomersService
  ) {}

  /** 칸반 보드 (단계 + 카드) */
  @Get()
  board() {
    return this.service.board();
  }

  @Post()
  async add(@Body() body: { memberId: number; assignedTo?: number }) {
    const progress = await this.service.add(body.memberId, body.assignedTo);
    return { success: true, id: progress.id };
  }

  @Patch(":id(\\d+)")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { stageId?: number; assignedTo?: number | null; note?: string | null }
  ) {
    await this.service.update(id, body);
    return { success: true };
  }

  @Delete(":id(\\d+)")
  async remove(@Param("id", ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { success: true };
  }

  // ── 단계 관리 ────────────────────────────────────────────────
  @Get("stages")
  findStages() {
    return this.service.findStages();
  }

  @Post("stages")
  async createStage(@Body() body: Partial<NewcomerStage>) {
    const stage = await this.service.createStage(body);
    return { success: true, id: stage.id };
  }

  @Patch("stages/:id")
  async updateStage(@Param("id", ParseIntPipe) id: number, @Body() body: Partial<NewcomerStage>) {
    await this.service.updateStage(id, body);
    return { success: true };
  }

  @Delete("stages/:id")
  async removeStage(@Param("id", ParseIntPipe) id: number) {
    await this.service.removeStage(id);
    return { success: true };
  }
}
