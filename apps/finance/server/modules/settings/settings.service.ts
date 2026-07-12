import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Account, Department, FiscalYear } from "./settings.entities";

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(FiscalYear)
    private readonly fiscalRepo: Repository<FiscalYear>,
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>
  ) {}

  // ── 회계연도 ─────────────────────────────────────────────────

  findFiscalYears(): Promise<FiscalYear[]> {
    return this.fiscalRepo.find({ order: { year: "DESC" } });
  }

  /** 현재 연도 회계연도 — 없으면 생성 (첫 사용 자동 온보딩) */
  async currentFiscalYear(): Promise<FiscalYear> {
    const year = new Date().getFullYear();
    let fiscal = await this.fiscalRepo.findOne({ where: { year } });
    if (!fiscal) {
      fiscal = await this.fiscalRepo.save(this.fiscalRepo.create({ year, status: "open" }));
    }
    return fiscal;
  }

  async createFiscalYear(year: number, openingBalance?: number): Promise<FiscalYear> {
    const existing = await this.fiscalRepo.findOne({ where: { year } });
    if (existing) throw new BadRequestException("이미 존재하는 회계연도입니다");
    return this.fiscalRepo.save(
      this.fiscalRepo.create({ year, openingBalance: String(openingBalance ?? 0) })
    );
  }

  // ── 부서 ────────────────────────────────────────────────────

  findDepartments(): Promise<Department[]> {
    return this.departmentRepo.find({
      where: { status: "active" },
      order: { displayOrder: "ASC", id: "ASC" },
    });
  }

  async createDepartment(name: string): Promise<Department> {
    return this.departmentRepo.save(this.departmentRepo.create({ name }));
  }

  async updateDepartment(
    id: number,
    data: Partial<Pick<Department, "name" | "displayOrder" | "status">>
  ): Promise<void> {
    const department = await this.departmentRepo.findOne({ where: { id } });
    if (!department) throw new NotFoundException("부서를 찾을 수 없습니다");
    Object.assign(department, data);
    await this.departmentRepo.save(department);
  }

  // ── 계정과목 ─────────────────────────────────────────────────

  findAccounts(kind?: "income" | "expense"): Promise<Account[]> {
    return this.accountRepo.find({
      where: { status: "active", ...(kind ? { kind } : {}) },
      order: { kind: "ASC", displayOrder: "ASC", id: "ASC" },
    });
  }

  async createAccount(data: {
    kind: "income" | "expense";
    name: string;
    departmentId?: number | null;
    displayOrder?: number;
  }): Promise<Account> {
    if (data.kind === "expense" && data.departmentId) {
      const dept = await this.departmentRepo.findOne({ where: { id: data.departmentId } });
      if (!dept) throw new BadRequestException("부서를 찾을 수 없습니다");
    }
    return this.accountRepo.save(this.accountRepo.create(data));
  }

  async updateAccount(
    id: number,
    data: Partial<Pick<Account, "name" | "departmentId" | "displayOrder" | "status">>
  ): Promise<void> {
    const account = await this.accountRepo.findOne({ where: { id } });
    if (!account) throw new NotFoundException("계정과목을 찾을 수 없습니다");
    if (account.isBuiltIn && data.status === "archived") {
      throw new BadRequestException("기본 계정과목은 보관할 수 없습니다");
    }
    Object.assign(account, data);
    await this.accountRepo.save(account);
  }
}
