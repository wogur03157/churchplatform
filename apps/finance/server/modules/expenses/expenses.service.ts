import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";
import { AuditService } from "../audit/audit.service";
import { Account, Department } from "../settings/settings.entities";
import { ApprovalEntry, ExpenseAttachment, ExpenseRequest, ExpenseStatus } from "./expenses.entities";

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(ExpenseRequest)
    private readonly expenseRepo: Repository<ExpenseRequest>,
    @InjectRepository(ExpenseAttachment)
    private readonly attachmentRepo: Repository<ExpenseAttachment>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    @Inject(AuditService)
    private readonly audit: AuditService
  ) {}

  // ── 기안 ────────────────────────────────────────────────────

  async create(
    data: {
      departmentId: number;
      accountId: number;
      amount: number;
      title: string;
      description?: string | null;
    },
    actorUserId: number
  ): Promise<ExpenseRequest> {
    if (!data.amount || data.amount <= 0) {
      throw new BadRequestException("금액은 1원 이상이어야 합니다");
    }
    const department = await this.departmentRepo.findOne({ where: { id: data.departmentId } });
    if (!department) throw new BadRequestException("부서를 찾을 수 없습니다");
    const account = await this.accountRepo.findOne({
      where: { id: data.accountId, kind: "expense", status: "active" },
    });
    if (!account) throw new BadRequestException("유효한 지출 계정과목이 아닙니다");

    const expense = await this.expenseRepo.save(
      this.expenseRepo.create({
        requestNo: await this.nextRequestNo(),
        departmentId: data.departmentId,
        accountId: data.accountId,
        amount: String(data.amount),
        title: data.title,
        description: data.description ?? null,
        requestedBy: actorUserId,
        status: "pending",
      })
    );
    await this.audit.log({
      actorUserId,
      action: "create",
      targetType: "expense",
      targetId: expense.id,
      detail: { amount: data.amount, title: data.title },
    });
    return expense;
  }

  /** 연번 채번 — 연도별 순번 (2026-001) */
  private async nextRequestNo(): Promise<string> {
    const year = new Date().getFullYear();
    const last = await this.expenseRepo
      .createQueryBuilder("e")
      .where("e.requestNo LIKE :prefix", { prefix: `${year}-%` })
      .orderBy("e.id", "DESC")
      .getOne();
    const lastSeq = last ? parseInt(last.requestNo.split("-")[1]) : 0;
    return `${year}-${String(lastSeq + 1).padStart(3, "0")}`;
  }

  // ── 승인 / 반려 (finance_approve 권한은 컨트롤러 가드에서 검사) ──

  async review(
    id: number,
    action: "approve" | "reject",
    comment: string | null,
    actorUserId: number
  ): Promise<void> {
    const expense = await this.findOne(id);
    if (expense.status !== "pending") {
      throw new BadRequestException("대기 중인 결의서만 처리할 수 있습니다");
    }
    if (action === "reject" && !comment?.trim()) {
      throw new BadRequestException("반려 사유가 필요합니다");
    }

    const entry: ApprovalEntry = {
      approverId: actorUserId,
      action,
      at: new Date().toISOString(),
      comment: comment?.trim() || null,
    };
    expense.approvals = [...(expense.approvals ?? []), entry];
    expense.status = action === "approve" ? "approved" : "rejected";
    await this.expenseRepo.save(expense);
    await this.audit.log({
      actorUserId,
      action,
      targetType: "expense",
      targetId: id,
      detail: { comment: entry.comment },
    });
  }

  // ── 지급 ────────────────────────────────────────────────────

  async pay(
    id: number,
    data: { paidAt: string; paidMethod: "cash" | "transfer" | "card" },
    actorUserId: number
  ): Promise<void> {
    const expense = await this.findOne(id);
    if (expense.status !== "approved") {
      throw new BadRequestException("승인된 결의서만 지급할 수 있습니다");
    }
    expense.status = "paid";
    expense.paidAt = data.paidAt;
    expense.paidMethod = data.paidMethod;
    expense.paidBy = actorUserId;
    await this.expenseRepo.save(expense);
    await this.audit.log({
      actorUserId,
      action: "pay",
      targetType: "expense",
      targetId: id,
      detail: { paidAt: data.paidAt, paidMethod: data.paidMethod },
    });
  }

  /** 취소 — 지급 전(pending/approved)만 가능. 지급된 기록은 불변 */
  async void(id: number, reason: string, actorUserId: number): Promise<void> {
    if (!reason?.trim()) throw new BadRequestException("취소 사유가 필요합니다");
    const expense = await this.findOne(id);
    if (expense.status !== "pending" && expense.status !== "approved") {
      throw new BadRequestException("지급 전 결의서만 취소할 수 있습니다");
    }
    expense.status = "voided";
    expense.voidReason = reason.trim();
    await this.expenseRepo.save(expense);
    await this.audit.log({
      actorUserId,
      action: "void",
      targetType: "expense",
      targetId: id,
      detail: { reason: reason.trim() },
    });
  }

  // ── 조회 ────────────────────────────────────────────────────

  async findOne(id: number): Promise<ExpenseRequest> {
    const expense = await this.expenseRepo.findOne({ where: { id } });
    if (!expense) throw new NotFoundException("결의서를 찾을 수 없습니다");
    return expense;
  }

  async findAll(filter: {
    status?: ExpenseStatus;
    departmentId?: number;
    from?: string;
    to?: string;
  }): Promise<Array<ExpenseRequest & { attachmentCount: number }>> {
    const qb = this.expenseRepo.createQueryBuilder("e");
    if (filter.status) qb.andWhere("e.status = :status", { status: filter.status });
    if (filter.departmentId)
      qb.andWhere("e.departmentId = :departmentId", { departmentId: filter.departmentId });
    if (filter.from) qb.andWhere("e.createdAt >= :from", { from: filter.from });
    if (filter.to) qb.andWhere("e.createdAt <= :to", { to: `${filter.to} 23:59:59` });
    const items = await qb.orderBy("e.id", "DESC").take(200).getMany();

    const counts = items.length
      ? await this.attachmentRepo
          .createQueryBuilder("a")
          .select("a.expenseRequestId", "expenseRequestId")
          .addSelect("COUNT(*)", "count")
          .where("a.expenseRequestId IN (:...ids)", { ids: items.map((i) => i.id) })
          .groupBy("a.expenseRequestId")
          .getRawMany<{ expenseRequestId: number; count: string }>()
      : [];
    const countMap = new Map(counts.map((c) => [Number(c.expenseRequestId), Number(c.count)]));
    return items.map((i) => ({ ...i, attachmentCount: countMap.get(i.id) ?? 0 }));
  }

  /** 기간 지출 집계 — 지급 완료 기준, 부서별 */
  async summary(from: string, to: string) {
    const rows = await this.expenseRepo
      .createQueryBuilder("e")
      .select("e.departmentId", "departmentId")
      .addSelect("COUNT(*)", "count")
      .addSelect("SUM(e.amount)", "total")
      .where("e.status = 'paid' AND e.paidAt BETWEEN :from AND :to", { from, to })
      .groupBy("e.departmentId")
      .getRawMany<{ departmentId: number; count: string; total: string }>();

    const departments = await this.departmentRepo.find();
    const deptMap = new Map(departments.map((d) => [d.id, d.name]));
    const byDepartment = rows.map((r) => ({
      departmentId: Number(r.departmentId),
      departmentName: deptMap.get(Number(r.departmentId)) ?? "(삭제됨)",
      count: Number(r.count),
      total: Number(r.total),
    }));
    return {
      from,
      to,
      byDepartment,
      grandTotal: byDepartment.reduce((sum, r) => sum + r.total, 0),
    };
  }

  // ── 첨부 (영수증) ────────────────────────────────────────────

  async addAttachment(
    expenseRequestId: number,
    file: { fileBase64: string; fileName: string; mimeType?: string },
    actorUserId: number
  ): Promise<ExpenseAttachment> {
    const expense = await this.findOne(expenseRequestId);
    if (expense.status === "paid" || expense.status === "voided") {
      throw new BadRequestException("종결된 결의서에는 첨부할 수 없습니다");
    }
    const base64 = file.fileBase64.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(base64, "base64");
    if (buffer.length > 10 * 1024 * 1024) {
      throw new BadRequestException("첨부 파일은 10MB 이하여야 합니다");
    }

    const ext = (file.fileName.split(".").pop() ?? "bin").toLowerCase().slice(0, 8);
    const fileKey = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
    const dir = join(process.cwd(), "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, fileKey), buffer);

    const attachment = await this.attachmentRepo.save(
      this.attachmentRepo.create({
        expenseRequestId,
        fileKey,
        fileName: file.fileName,
        mimeType: file.mimeType ?? null,
      })
    );
    await this.audit.log({
      actorUserId,
      action: "attach",
      targetType: "expense",
      targetId: expenseRequestId,
      detail: { fileName: file.fileName },
    });
    return attachment;
  }

  findAttachments(expenseRequestId: number): Promise<ExpenseAttachment[]> {
    return this.attachmentRepo.find({ where: { expenseRequestId }, order: { id: "ASC" } });
  }
}
