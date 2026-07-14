import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { assertAmount, assertDateString } from "../../lib/validate";
import { AuditService } from "../audit/audit.service";
import { ClosingsService } from "../closings/closings.service";
import { Account } from "../settings/settings.entities";
import { Offering, OfferingBatch } from "./offerings.entities";

export interface OfferingInput {
  date: string;
  accountId: number;
  amount: number;
  memberId?: number | null;
  donorName?: string | null;
  method?: Offering["method"];
  envelopeNo?: string | null;
  serviceType?: string | null;
  batchId?: number | null;
  replacesId?: number | null;
}

@Injectable()
export class OfferingsService {
  constructor(
    @InjectRepository(Offering)
    private readonly offeringRepo: Repository<Offering>,
    @InjectRepository(OfferingBatch)
    private readonly batchRepo: Repository<OfferingBatch>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @Inject(AuditService)
    private readonly audit: AuditService,
    @Inject(ClosingsService)
    private readonly closings: ClosingsService
  ) {}

  // ── 계수 세션(배치) ───────────────────────────────────────────

  findBatches(): Promise<OfferingBatch[]> {
    return this.batchRepo.find({ order: { date: "DESC", id: "DESC" }, take: 50 });
  }

  async startBatch(
    data: { date: string; serviceType: string; counters?: string[] },
    actorUserId: number
  ): Promise<OfferingBatch> {
    assertDateString(data.date);
    await this.closings.assertNotLocked(data.date);
    const batch = await this.batchRepo.save(
      this.batchRepo.create({ ...data, createdBy: actorUserId, status: "counting" })
    );
    await this.audit.log({
      actorUserId,
      action: "create",
      targetType: "offering_batch",
      targetId: batch.id,
    });
    return batch;
  }

  /** 계수 확정 — 합계 고정. 이후 이 배치에는 입력 불가(취소만 가능) */
  async confirmBatch(id: number, actorUserId: number): Promise<OfferingBatch> {
    const batch = await this.batchRepo.findOne({ where: { id } });
    if (!batch) throw new NotFoundException("계수 세션을 찾을 수 없습니다");
    if (batch.status === "confirmed") throw new BadRequestException("이미 확정된 세션입니다");
    await this.closings.assertNotLocked(batch.date);

    const row = await this.offeringRepo
      .createQueryBuilder("o")
      .select("COALESCE(SUM(o.amount), 0)", "total")
      .where("o.batchId = :id AND o.status = 'confirmed'", { id })
      .getRawOne<{ total: string }>();
    const total = row?.total ?? "0";

    batch.totalAmount = total;
    batch.status = "confirmed";
    batch.confirmedAt = new Date();
    await this.batchRepo.save(batch);
    await this.audit.log({
      actorUserId,
      action: "confirm",
      targetType: "offering_batch",
      targetId: id,
      detail: { totalAmount: total },
    });
    return batch;
  }

  /** 계수표 데이터 — 종류별/방법별 합계 */
  async batchSheet(id: number) {
    const batch = await this.batchRepo.findOne({ where: { id } });
    if (!batch) throw new NotFoundException("계수 세션을 찾을 수 없습니다");

    const byAccount = await this.offeringRepo
      .createQueryBuilder("o")
      .select("o.accountId", "accountId")
      .addSelect("COUNT(*)", "count")
      .addSelect("SUM(o.amount)", "total")
      .where("o.batchId = :id AND o.status = 'confirmed'", { id })
      .groupBy("o.accountId")
      .getRawMany<{ accountId: number; count: string; total: string }>();

    const byMethod = await this.offeringRepo
      .createQueryBuilder("o")
      .select("o.method", "method")
      .addSelect("SUM(o.amount)", "total")
      .where("o.batchId = :id AND o.status = 'confirmed'", { id })
      .groupBy("o.method")
      .getRawMany<{ method: string; total: string }>();

    const accounts = await this.accountRepo.find({ where: { kind: "income" } });
    const accountMap = new Map(accounts.map((a) => [a.id, a.name]));

    return {
      batch,
      byAccount: byAccount.map((r) => ({
        accountId: Number(r.accountId),
        accountName: accountMap.get(Number(r.accountId)) ?? "(삭제됨)",
        count: Number(r.count),
        total: Number(r.total),
      })),
      byMethod: byMethod.map((r) => ({ method: r.method, total: Number(r.total) })),
      grandTotal: byAccount.reduce((sum, r) => sum + Number(r.total), 0),
    };
  }

  // ── 헌금 기록 (불변 원장) ─────────────────────────────────────

  async create(input: OfferingInput, actorUserId: number): Promise<Offering> {
    assertAmount(input.amount);
    assertDateString(input.date);
    await this.closings.assertNotLocked(input.date);
    const account = await this.accountRepo.findOne({
      where: { id: input.accountId, kind: "income", status: "active" },
    });
    if (!account) throw new BadRequestException("유효한 수입 계정과목이 아닙니다");

    if (input.batchId) {
      const batch = await this.batchRepo.findOne({ where: { id: input.batchId } });
      if (!batch) throw new BadRequestException("계수 세션을 찾을 수 없습니다");
      if (batch.status !== "counting") {
        throw new BadRequestException("확정된 계수 세션에는 입력할 수 없습니다");
      }
    }

    const offering = await this.offeringRepo.save(
      this.offeringRepo.create({
        date: input.date,
        accountId: input.accountId,
        amount: String(input.amount),
        memberId: input.memberId ?? null,
        donorName: input.donorName ?? null,
        method: input.method ?? "cash",
        envelopeNo: input.envelopeNo ?? null,
        serviceType: input.serviceType ?? null,
        batchId: input.batchId ?? null,
        replacesId: input.replacesId ?? null,
        createdBy: actorUserId,
      })
    );
    await this.audit.log({
      actorUserId,
      action: "create",
      targetType: "offering",
      targetId: offering.id,
      detail: { amount: input.amount, accountId: input.accountId },
    });
    return offering;
  }

  /** 취소 — 삭제 대신 voided 처리. 정정은 취소 후 replacesId로 재입력 */
  async void(id: number, reason: string, actorUserId: number): Promise<void> {
    if (!reason?.trim()) throw new BadRequestException("취소 사유가 필요합니다");
    const offering = await this.offeringRepo.findOne({ where: { id } });
    if (!offering) throw new NotFoundException("헌금 기록을 찾을 수 없습니다");
    if (offering.status === "voided") throw new BadRequestException("이미 취소된 기록입니다");
    await this.closings.assertNotLocked(offering.date);

    offering.status = "voided";
    offering.voidedBy = actorUserId;
    offering.voidedAt = new Date();
    offering.voidReason = reason.trim();
    await this.offeringRepo.save(offering);
    await this.audit.log({
      actorUserId,
      action: "void",
      targetType: "offering",
      targetId: id,
      detail: { reason: reason.trim() },
    });
  }

  async findAll(filter: {
    from?: string;
    to?: string;
    accountId?: number;
    memberId?: number;
    batchId?: number;
    includeVoided?: boolean;
  }): Promise<Offering[]> {
    const qb = this.offeringRepo.createQueryBuilder("o");
    if (!filter.includeVoided) qb.andWhere("o.status = 'confirmed'");
    if (filter.from) qb.andWhere("o.date >= :from", { from: filter.from });
    if (filter.to) qb.andWhere("o.date <= :to", { to: filter.to });
    if (filter.accountId) qb.andWhere("o.accountId = :accountId", { accountId: filter.accountId });
    if (filter.memberId) qb.andWhere("o.memberId = :memberId", { memberId: filter.memberId });
    if (filter.batchId) qb.andWhere("o.batchId = :batchId", { batchId: filter.batchId });
    return qb.orderBy("o.date", "DESC").addOrderBy("o.id", "DESC").take(500).getMany();
  }

  /** 기간 수입 집계 — 주보/월간 보고의 원천 */
  async summary(from: string, to: string) {
    const rows = await this.offeringRepo
      .createQueryBuilder("o")
      .select("o.accountId", "accountId")
      .addSelect("COUNT(*)", "count")
      .addSelect("SUM(o.amount)", "total")
      .where("o.status = 'confirmed' AND o.date BETWEEN :from AND :to", { from, to })
      .groupBy("o.accountId")
      .getRawMany<{ accountId: number; count: string; total: string }>();

    const accounts = await this.accountRepo.find({ where: { kind: "income" } });
    const accountMap = new Map(accounts.map((a) => [a.id, a.name]));

    const byAccount = rows.map((r) => ({
      accountId: Number(r.accountId),
      accountName: accountMap.get(Number(r.accountId)) ?? "(삭제됨)",
      count: Number(r.count),
      total: Number(r.total),
    }));
    return {
      from,
      to,
      byAccount,
      grandTotal: byAccount.reduce((sum, r) => sum + r.total, 0),
    };
  }
}
