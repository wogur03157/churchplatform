import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { AuditService } from "../audit/audit.service";
import { Offering } from "../offerings/offerings.entities";
import { Account, FinanceConfig } from "../settings/settings.entities";
import { decryptValue } from "../../lib/encrypted-column";
import { DonationReceipt } from "./receipt.entity";

/** 국세청 기부금 유형 코드 — 종교단체 지정기부금 */
const NTS_DONATION_TYPE_CODE = "41";

@Injectable()
export class ReceiptsService {
  constructor(
    @InjectRepository(DonationReceipt)
    private readonly receiptRepo: Repository<DonationReceipt>,
    @InjectRepository(Offering)
    private readonly offeringRepo: Repository<Offering>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(FinanceConfig)
    private readonly configRepo: Repository<FinanceConfig>,
    @Inject(AuditService)
    private readonly audit: AuditService
  ) {}

  // ── 연간 집계 (발급 대상 목록) ────────────────────────────────

  /** 교인별 연간 헌금 합계 (교적 연결 건만 — 무기명 제외) + 발급 상태 */
  async aggregate(year: number) {
    const rows = await this.offeringRepo
      .createQueryBuilder("o")
      .select("o.memberId", "memberId")
      .addSelect("COUNT(*)", "count")
      .addSelect("SUM(o.amount)", "total")
      .where("o.status = 'confirmed' AND o.memberId IS NOT NULL AND YEAR(o.date) = :year", { year })
      .groupBy("o.memberId")
      .orderBy("total", "DESC")
      .getRawMany<{ memberId: number; count: string; total: string }>();

    const receipts = await this.receiptRepo.find({ where: { year, canceledAt: IsNull() } });
    const receiptMap = new Map(receipts.map((r) => [r.memberId, r]));

    return rows.map((r) => {
      const receipt = receiptMap.get(Number(r.memberId));
      return {
        memberId: Number(r.memberId),
        count: Number(r.count),
        total: Number(r.total),
        receiptId: receipt?.id ?? null,
        receiptNo: receipt?.receiptNo ?? null,
        hasRrn: receipt ? receipt.donorRrn !== null : false,
      };
    });
  }

  // ── 발급 ────────────────────────────────────────────────────

  /** 일괄 발급 — 이름은 클라이언트(교적)에서 스냅샷으로 전달, 주민번호는 선택 */
  async issue(
    year: number,
    items: Array<{ memberId: number; donorName: string; rrn?: string | null }>,
    actorUserId: number
  ): Promise<{ issued: number; skipped: Array<{ memberId: number; reason: string }> }> {
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException("발급 대상이 없습니다");
    }
    const accounts = await this.accountRepo.find({ where: { kind: "income" } });
    const accountMap = new Map(accounts.map((a) => [a.id, a.name]));

    let issued = 0;
    const skipped: Array<{ memberId: number; reason: string }> = [];

    for (const item of items) {
      if (!item.donorName?.trim()) {
        skipped.push({ memberId: item.memberId, reason: "성명 누락" });
        continue;
      }
      const existing = await this.receiptRepo.findOne({
        where: { year, memberId: item.memberId, canceledAt: IsNull() },
      });
      if (existing) {
        skipped.push({ memberId: item.memberId, reason: `이미 발급됨 (${existing.receiptNo})` });
        continue;
      }

      // 발급 시점 재집계 (스냅샷)
      const detail = await this.offeringRepo
        .createQueryBuilder("o")
        .select("o.accountId", "accountId")
        .addSelect("SUM(o.amount)", "total")
        .where(
          "o.status = 'confirmed' AND o.memberId = :memberId AND YEAR(o.date) = :year",
          { memberId: item.memberId, year }
        )
        .groupBy("o.accountId")
        .getRawMany<{ accountId: number; total: string }>();
      const total = detail.reduce((s, d) => s + Number(d.total), 0);
      if (total <= 0) {
        skipped.push({ memberId: item.memberId, reason: "해당 연도 헌금 없음" });
        continue;
      }

      // 동시 발급 시 일련번호 충돌(unique) 가능 — 재채번으로 최대 3회 재시도
      let receipt!: DonationReceipt;
      for (let attempt = 0; ; attempt += 1) {
        try {
          receipt = await this.receiptRepo.save(
            this.receiptRepo.create({
              receiptNo: await this.nextReceiptNo(year),
              memberId: item.memberId,
              donorName: item.donorName.trim(),
              donorRrn: this.normalizeRrn(item.rrn),
              year,
              totalAmount: String(total),
              breakdown: detail.map((d) => ({
                name: accountMap.get(Number(d.accountId)) ?? "(삭제됨)",
                total: Number(d.total),
              })),
              issuedBy: actorUserId,
            })
          );
          break;
        } catch (error) {
          const isDuplicate = (error as { driverError?: { code?: string } })?.driverError?.code === "ER_DUP_ENTRY";
          if (!isDuplicate || attempt >= 2) throw error;
        }
      }
      issued += 1;
      await this.audit.log({
        actorUserId,
        action: "issue",
        targetType: "donation_receipt",
        targetId: receipt.id,
        detail: { receiptNo: receipt.receiptNo, year, total },
      });
    }
    return { issued, skipped };
  }

  private normalizeRrn(rrn?: string | null): string | null {
    if (!rrn?.trim()) return null;
    const digits = rrn.replace(/[^0-9]/g, "");
    if (digits.length !== 13) {
      throw new BadRequestException("주민등록번호는 13자리여야 합니다");
    }
    return digits;
  }

  private async nextReceiptNo(year: number): Promise<string> {
    const last = await this.receiptRepo
      .createQueryBuilder("r")
      .where("r.receiptNo LIKE :prefix", { prefix: `${year}-%` })
      .orderBy("r.id", "DESC")
      .getOne();
    const lastSeq = last ? parseInt(last.receiptNo.split("-")[1]) : 0;
    return `${year}-${String(lastSeq + 1).padStart(4, "0")}`;
  }

  // ── 대장 / 상세 / 취소 ────────────────────────────────────────

  async findAll(year: number) {
    const receipts = await this.receiptRepo.find({ where: { year }, order: { id: "ASC" } });
    // 주민번호는 목록에 노출하지 않는다 — 보유 여부만
    return receipts.map(({ donorRrn, ...rest }) => ({ ...rest, hasRrn: donorRrn !== null }));
  }

  /** 영수증 출력용 상세 — 주민번호는 마스킹(앞 6자리 + *) */
  async findOne(id: number) {
    const receipt = await this.receiptRepo.findOne({ where: { id } });
    if (!receipt) throw new NotFoundException("영수증을 찾을 수 없습니다");
    const { donorRrn, ...rest } = receipt;
    return {
      ...rest,
      donorRrnMasked: donorRrn ? `${donorRrn.slice(0, 6)}-${donorRrn.slice(6, 7)}******` : null,
      orgName: await this.getConfig("org_name"),
      orgTaxId: await this.getConfig("org_tax_id"),
    };
  }

  async cancel(id: number, actorUserId: number): Promise<void> {
    const receipt = await this.receiptRepo.findOne({ where: { id } });
    if (!receipt) throw new NotFoundException("영수증을 찾을 수 없습니다");
    if (receipt.canceledAt) throw new BadRequestException("이미 취소된 영수증입니다");
    receipt.canceledAt = new Date();
    receipt.canceledBy = actorUserId;
    await this.receiptRepo.save(receipt);
    await this.audit.log({
      actorUserId,
      action: "cancel",
      targetType: "donation_receipt",
      targetId: id,
      detail: { receiptNo: receipt.receiptNo },
    });
  }

  // ── 국세청 제출용 파일 ────────────────────────────────────────

  /**
   * 연말정산 간소화(홈택스 기부금 자료) 제출용 CSV.
   * 주민번호가 입력된 활성 영수증만 포함되며, 파일 생성은 감사 로그에 남는다.
   */
  async ntsFile(year: number, actorUserId: number): Promise<{ csv: string; count: number; missing: number }> {
    const orgName = (await this.getConfig("org_name")) ?? "";
    const orgTaxId = (await this.getConfig("org_tax_id")) ?? "";
    if (!orgName || !orgTaxId) {
      throw new BadRequestException("재정 설정에서 단체명과 고유번호를 먼저 입력해주세요");
    }

    const receipts = await this.receiptRepo.find({
      where: { year, canceledAt: IsNull() },
      order: { id: "ASC" },
    });
    const withRrn = receipts.filter((r) => r.donorRrn !== null);

    const header = "일련번호,기부자성명,주민등록번호,기부유형코드,기부금액,단체명,단체고유번호,귀속연도";
    const lines = withRrn.map((r) =>
      [
        r.receiptNo,
        r.donorName,
        r.donorRrn,
        NTS_DONATION_TYPE_CODE,
        Number(r.totalAmount),
        orgName,
        orgTaxId,
        year,
      ].join(",")
    );
    await this.audit.log({
      actorUserId,
      action: "export",
      targetType: "nts_file",
      detail: { year, count: withRrn.length },
    });
    return {
      // BOM — 엑셀에서 한글 깨짐 방지
      csv: "﻿" + [header, ...lines].join("\r\n"),
      count: withRrn.length,
      missing: receipts.length - withRrn.length,
    };
  }

  // ── 단체 정보 (finance_config) ────────────────────────────────

  async getConfig(key: string): Promise<string | null> {
    const config = await this.configRepo.findOne({ where: { key } });
    return config?.value ?? null;
  }

  async setOrgInfo(orgName: string, orgTaxId: string): Promise<void> {
    await this.configRepo.upsert({ key: "org_name", value: orgName }, { conflictPaths: ["key"] });
    await this.configRepo.upsert({ key: "org_tax_id", value: orgTaxId }, { conflictPaths: ["key"] });
  }
}
