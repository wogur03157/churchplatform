import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { assertAmount } from "../../lib/validate";
import { AuditService } from "../audit/audit.service";
import { ExpenseRequest } from "../expenses/expenses.entities";
import { Account, Department } from "../settings/settings.entities";
import { Budget } from "./budget.entity";

export interface BudgetStatusRow {
  accountId: number;
  accountName: string;
  departmentId: number | null;
  departmentName: string | null;
  budget: number;
  spent: number;
  remaining: number;
  ratio: number | null;
}

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepo: Repository<Budget>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    @InjectRepository(ExpenseRequest)
    private readonly expenseRepo: Repository<ExpenseRequest>,
    @Inject(AuditService)
    private readonly audit: AuditService
  ) {}

  /** 편성 + 집행 현황 — 모든 활성 지출 계정 기준 */
  async status(year: number): Promise<{ year: number; rows: BudgetStatusRow[]; totals: { budget: number; spent: number } }> {
    const accounts = await this.accountRepo.find({
      where: { kind: "expense", status: "active" },
      order: { displayOrder: "ASC", id: "ASC" },
    });
    const departments = await this.departmentRepo.find();
    const deptMap = new Map(departments.map((d) => [d.id, d.name]));

    const budgets = await this.budgetRepo.find({ where: { year } });
    const budgetMap = new Map(budgets.map((b) => [b.accountId, Number(b.amount)]));

    const spentRows = await this.expenseRepo
      .createQueryBuilder("e")
      .select("e.accountId", "accountId")
      .addSelect("SUM(e.amount)", "total")
      .where("e.status = 'paid' AND YEAR(e.paidAt) = :year", { year })
      .groupBy("e.accountId")
      .getRawMany<{ accountId: number; total: string }>();
    const spentMap = new Map(spentRows.map((r) => [Number(r.accountId), Number(r.total)]));

    const rows = accounts.map((a) => {
      const budget = budgetMap.get(a.id) ?? 0;
      const spent = spentMap.get(a.id) ?? 0;
      return {
        accountId: a.id,
        accountName: a.name,
        departmentId: a.departmentId,
        departmentName: a.departmentId ? (deptMap.get(a.departmentId) ?? null) : null,
        budget,
        spent,
        remaining: budget - spent,
        ratio: budget > 0 ? Math.round((spent / budget) * 100) : null,
      };
    });

    return {
      year,
      rows,
      totals: {
        budget: rows.reduce((s, r) => s + r.budget, 0),
        spent: rows.reduce((s, r) => s + r.spent, 0),
      },
    };
  }

  /** 편성 일괄 저장 — {accountId, amount}[] (amount 0이면 행 삭제) */
  async save(
    year: number,
    entries: Array<{ accountId: number; amount: number }>,
    actorUserId: number
  ): Promise<void> {
    if (!Array.isArray(entries)) throw new BadRequestException("entries가 필요합니다");
    for (const entry of entries) {
      if (entry.amount !== 0) assertAmount(entry.amount, "예산");
      if (entry.amount === 0) {
        await this.budgetRepo.delete({ year, accountId: entry.accountId });
      } else {
        await this.budgetRepo.upsert(
          {
            year,
            accountId: entry.accountId,
            amount: String(entry.amount),
            updatedBy: actorUserId,
          },
          { conflictPaths: ["year", "accountId"] }
        );
      }
    }
    await this.audit.log({
      actorUserId,
      action: "save",
      targetType: "budget",
      detail: { year, count: entries.length },
    });
  }

  /** 지출결의 기안 시 예산 초과 경고용 — 예산 없으면 null */
  async overrunWarning(accountId: number, addAmount: number): Promise<string | null> {
    const year = new Date().getFullYear();
    const budget = await this.budgetRepo.findOne({ where: { year, accountId } });
    if (!budget) return null;

    // 확정 예정 금액 = 지급 완료(지급일 기준) + 승인됨(아직 미지급 — 기안일 기준)
    const spentRow = await this.expenseRepo
      .createQueryBuilder("e")
      .select("COALESCE(SUM(e.amount), 0)", "total")
      .where(
        `e.accountId = :accountId AND (
          (e.status = 'paid' AND YEAR(e.paidAt) = :year)
          OR (e.status = 'approved' AND YEAR(e.createdAt) = :year)
        )`,
        { accountId, year }
      )
      .getRawOne<{ total: string }>();
    const committed = Number(spentRow?.total ?? 0) + addAmount;
    const budgetAmount = Number(budget.amount);

    if (committed > budgetAmount) {
      const over = committed - budgetAmount;
      return `예산 초과 경고: 연간 예산 ${budgetAmount.toLocaleString("ko-KR")}원 대비 ${over.toLocaleString("ko-KR")}원 초과됩니다`;
    }
    return null;
  }
}
