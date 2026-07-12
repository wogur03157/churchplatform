import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

/** 계수 세션 — 주일 저녁 헌금 계수 한 번이 배치 하나 */
@Entity("offering_batches")
export class OfferingBatch {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "date" })
  date!: string;

  @Column({ type: "varchar", length: 50, comment: "주일1부/수요예배 등" })
  serviceType!: string;

  @Column({ type: "json", nullable: true, comment: "계수자 명단(2인 이상 권장)" })
  counters!: string[] | null;

  /** 확정 시점의 합계 (KRW 정수) — 계수표의 금액 */
  @Column({ type: "decimal", precision: 15, scale: 0, default: 0 })
  totalAmount!: string;

  @Column({ type: "enum", enum: ["counting", "confirmed"], default: "counting" })
  status!: "counting" | "confirmed";

  @Column({ type: "timestamp", nullable: true })
  confirmedAt!: Date | null;

  @Column({ type: "int", comment: "중앙 users.id" })
  createdBy!: number;

  @CreateDateColumn()
  createdAt!: Date;
}

/**
 * 헌금 건별 기록 — 불변 원장.
 * 수정·삭제 금지: 취소(voided) 후 재입력하며 replacesId로 연결한다.
 */
@Entity("offerings")
export class Offering {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: "date" })
  date!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  serviceType!: string | null;

  @Index()
  @Column({ type: "int", comment: "수입 계정(헌금 종류) accounts.id" })
  accountId!: number;

  @Index()
  @Column({ type: "int", nullable: true, comment: "재적 members.id — NULL이면 무기명/미연결" })
  memberId!: number | null;

  @Column({ type: "varchar", length: 50, nullable: true, comment: "교적 미연결 헌금자 이름" })
  donorName!: string | null;

  @Column({ type: "decimal", precision: 15, scale: 0 })
  amount!: string;

  @Column({ type: "enum", enum: ["cash", "check", "transfer"], default: "cash" })
  method!: "cash" | "check" | "transfer";

  @Column({ type: "varchar", length: 20, nullable: true })
  envelopeNo!: string | null;

  @Index()
  @Column({ type: "int", nullable: true })
  batchId!: number | null;

  @Column({ type: "enum", enum: ["confirmed", "voided"], default: "confirmed" })
  status!: "confirmed" | "voided";

  @Column({ type: "int", nullable: true })
  voidedBy!: number | null;

  @Column({ type: "timestamp", nullable: true })
  voidedAt!: Date | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  voidReason!: string | null;

  @Column({ type: "int", nullable: true, comment: "재입력 시 원 레코드 offerings.id" })
  replacesId!: number | null;

  @Column({ type: "int", comment: "중앙 users.id" })
  createdBy!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
