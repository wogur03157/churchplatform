import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { PermissionGuard, RequirePermission } from "@platform/auth";
import { Account, Department } from "./settings.entities";
import { SettingsService } from "./settings.service";

@Controller()
@UseGuards(PermissionGuard)
@RequirePermission("finance")
export class SettingsController {
  constructor(
    @Inject(SettingsService)
    private readonly service: SettingsService
  ) {}

  // ── 회계연도 ─────────────────────────────────────────────────
  @Get("fiscal-years")
  findFiscalYears() {
    return this.service.findFiscalYears();
  }

  @Get("fiscal-years/current")
  currentFiscalYear() {
    return this.service.currentFiscalYear();
  }

  @Post("fiscal-years")
  async createFiscalYear(@Body() body: { year: number; openingBalance?: number }) {
    const fiscal = await this.service.createFiscalYear(body.year, body.openingBalance);
    return { success: true, id: fiscal.id };
  }

  // ── 부서 ────────────────────────────────────────────────────
  @Get("departments")
  findDepartments() {
    return this.service.findDepartments();
  }

  @Post("departments")
  async createDepartment(@Body() body: { name: string }) {
    const department = await this.service.createDepartment(body.name);
    return { success: true, id: department.id };
  }

  @Patch("departments/:id")
  async updateDepartment(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: Partial<Pick<Department, "name" | "displayOrder" | "status">>
  ) {
    await this.service.updateDepartment(id, body);
    return { success: true };
  }

  // ── 계정과목 ─────────────────────────────────────────────────
  @Get("accounts")
  findAccounts(@Query("kind") kind?: "income" | "expense") {
    return this.service.findAccounts(kind);
  }

  @Post("accounts")
  async createAccount(
    @Body()
    body: { kind: "income" | "expense"; name: string; departmentId?: number; displayOrder?: number }
  ) {
    const account = await this.service.createAccount(body);
    return { success: true, id: account.id };
  }

  @Patch("accounts/:id")
  async updateAccount(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: Partial<Pick<Account, "name" | "departmentId" | "displayOrder" | "status">>
  ) {
    await this.service.updateAccount(id, body);
    return { success: true };
  }
}
