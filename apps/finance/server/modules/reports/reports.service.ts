import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ExpenseRequest } from "../expenses/expenses.entities";
import { Offering } from "../offerings/offerings.entities";
import { Account, Department, FinanceConfig, FiscalYear } from "../settings/settings.entities";

export interface MonthlyReport {
  year: number;
  month: number;
  openingBalance: number; // 월초 잔액 (회계연도 이월 + 연초~전월 순수입)
  income: { rows: Array<{ name: string; count: number; total: number }>; total: number };
  expense: {
    rows: Array<{ name: string; departmentName: string | null; count: number; total: number }>;
    total: number;
  };
  closingBalance: number;
}

const TRANSPARENCY_KEY = "transparency_enabled";

function monthBounds(year: number, month: number): { start: string; end: string } {
  const lastDay = new Date(year, month, 0).getDate();
  const mm = String(month).padStart(2, "0");
  return { start: `${year}-${mm}-01`, end: `${year}-${mm}-${String(lastDay).padStart(2, "0")}` };
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Offering)
    private readonly offeringRepo: Repository<Offering>,
    @InjectRepository(ExpenseRequest)
    private readonly expenseRepo: Repository<ExpenseRequest>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    @InjectRepository(FiscalYear)
    private readonly fiscalRepo: Repository<FiscalYear>,
    @InjectRepository(FinanceConfig)
    private readonly configRepo: Repository<FinanceConfig>
  ) {}

  // ── 월간 보고서 ──────────────────────────────────────────────

  async monthly(year: number, month: number): Promise<MonthlyReport> {
    const { start, end } = monthBounds(year, month);

    const [incomeRows, expenseRows, accounts, departments, fiscal] = await Promise.all([
      this.incomeBetween(start, end),
      this.expenseBetween(start, end),
      this.accountRepo.find(),
      this.departmentRepo.find(),
      this.fiscalRepo.findOne({ where: { year } }),
    ]);
    const accountMap = new Map(accounts.map((a) => [a.id, a]));
    const deptMap = new Map(departments.map((d) => [d.id, d.name]));

    // 월초 잔액 = 회계연도 이월 + (연초 ~ 전월 말) 순수입
    const yearStart = `${year}-01-01`;
    const prevEnd = month === 1 ? null : monthBounds(year, month - 1).end;
    let openingBalance = Number(fiscal?.openingBalance ?? 0);
    if (prevEnd) {
      const [priorIncome, priorExpense] = await Promise.all([
        this.sumIncome(yearStart, prevEnd),
        this.sumExpense(yearStart, prevEnd),
      ]);
      openingBalance += priorIncome - priorExpense;
    }

    const income = {
      rows: incomeRows.map((r) => ({
        name: accountMap.get(r.accountId)?.name ?? "(삭제됨)",
        count: r.count,
        total: r.total,
      })),
      total: incomeRows.reduce((s, r) => s + r.total, 0),
    };
    const expense = {
      rows: expenseRows.map((r) => {
        const account = accountMap.get(r.accountId);
        return {
          name: account?.name ?? "(삭제됨)",
          departmentName: account?.departmentId ? (deptMap.get(account.departmentId) ?? null) : null,
          count: r.count,
          total: r.total,
        };
      }),
      total: expenseRows.reduce((s, r) => s + r.total, 0),
    };

    return {
      year,
      month,
      openingBalance,
      income,
      expense,
      closingBalance: openingBalance + income.total - expense.total,
    };
  }

  /** 주보용 — 특정 날짜(주일)의 헌금 종류별 합계 */
  async weekly(date: string) {
    const rows = await this.offeringRepo
      .createQueryBuilder("o")
      .select("o.accountId", "accountId")
      .addSelect("COUNT(*)", "count")
      .addSelect("SUM(o.amount)", "total")
      .where("o.status = 'confirmed' AND o.date = :date", { date })
      .groupBy("o.accountId")
      .getRawMany<{ accountId: number; count: string; total: string }>();
    const accounts = await this.accountRepo.find();
    const accountMap = new Map(accounts.map((a) => [a.id, a.name]));
    const byAccount = rows.map((r) => ({
      name: accountMap.get(Number(r.accountId)) ?? "(삭제됨)",
      count: Number(r.count),
      total: Number(r.total),
    }));
    return { date, byAccount, grandTotal: byAccount.reduce((s, r) => s + r.total, 0) };
  }

  // ── 투명성 설정 ──────────────────────────────────────────────

  async isTransparencyEnabled(): Promise<boolean> {
    const config = await this.configRepo.findOne({ where: { key: TRANSPARENCY_KEY } });
    return config?.value === "true";
  }

  async setTransparency(enabled: boolean): Promise<void> {
    await this.configRepo.upsert(
      { key: TRANSPARENCY_KEY, value: enabled ? "true" : "false" },
      { conflictPaths: ["key"] }
    );
  }

  // ── 내부 집계 헬퍼 ───────────────────────────────────────────

  private async incomeBetween(start: string, end: string) {
    const rows = await this.offeringRepo
      .createQueryBuilder("o")
      .select("o.accountId", "accountId")
      .addSelect("COUNT(*)", "count")
      .addSelect("SUM(o.amount)", "total")
      .where("o.status = 'confirmed' AND o.date BETWEEN :start AND :end", { start, end })
      .groupBy("o.accountId")
      .getRawMany<{ accountId: number; count: string; total: string }>();
    return rows.map((r) => ({
      accountId: Number(r.accountId),
      count: Number(r.count),
      total: Number(r.total),
    }));
  }

  private async expenseBetween(start: string, end: string) {
    const rows = await this.expenseRepo
      .createQueryBuilder("e")
      .select("e.accountId", "accountId")
      .addSelect("COUNT(*)", "count")
      .addSelect("SUM(e.amount)", "total")
      .where("e.status = 'paid' AND e.paidAt BETWEEN :start AND :end", { start, end })
      .groupBy("e.accountId")
      .getRawMany<{ accountId: number; count: string; total: string }>();
    return rows.map((r) => ({
      accountId: Number(r.accountId),
      count: Number(r.count),
      total: Number(r.total),
    }));
  }

  private async sumIncome(start: string, end: string): Promise<number> {
    const row = await this.offeringRepo
      .createQueryBuilder("o")
      .select("COALESCE(SUM(o.amount), 0)", "total")
      .where("o.status = 'confirmed' AND o.date BETWEEN :start AND :end", { start, end })
      .getRawOne<{ total: string }>();
    return Number(row?.total ?? 0);
  }

  private async sumExpense(start: string, end: string): Promise<number> {
    const row = await this.expenseRepo
      .createQueryBuilder("e")
      .select("COALESCE(SUM(e.amount), 0)", "total")
      .where("e.status = 'paid' AND e.paidAt BETWEEN :start AND :end", { start, end })
      .getRawOne<{ total: string }>();
    return Number(row?.total ?? 0);
  }
}
