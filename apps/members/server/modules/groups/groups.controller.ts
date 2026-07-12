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
import type { MemberGroup } from "./member-group.entity";
import { GroupsService } from "./groups.service";

@Controller("groups")
@UseGuards(PermissionGuard)
@RequirePermission("members")
export class GroupsController {
  constructor(
    @Inject(GroupsService)
    private readonly service: GroupsService
  ) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  async create(@Body() body: Partial<MemberGroup>) {
    const group = await this.service.create(body);
    return { success: true, id: group.id };
  }

  @Patch(":id")
  async update(@Param("id", ParseIntPipe) id: number, @Body() body: Partial<MemberGroup>) {
    await this.service.update(id, body);
    return { success: true };
  }

  @Delete(":id")
  async remove(@Param("id", ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { success: true };
  }

  @Get(":id/members")
  getMembers(@Param("id", ParseIntPipe) id: number) {
    return this.service.getMembers(id);
  }

  @Post(":id/members")
  addMembers(@Param("id", ParseIntPipe) id: number, @Body() body: { memberIds: number[] }) {
    return this.service.addMembers(id, body.memberIds ?? []);
  }

  @Delete(":id/members/:memberId")
  async removeMember(
    @Param("id", ParseIntPipe) id: number,
    @Param("memberId", ParseIntPipe) memberId: number
  ) {
    await this.service.removeMember(id, memberId);
    return { success: true };
  }
}
