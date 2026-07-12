import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";
import { encryptedColumn } from "../../lib/encrypted-column";

/**
 * 기부금영수증 발급 대장 — 소득세법상 발급명세 5년 보관 의무.
 * 발급 시점의 이름·금액·내역을 스냅샷으로 저장한다 (교적 변경과 무관하게 보존).
 * 취소 후 재발급 가능 — 연도당 활성(미취소) 영수증은 교인당 1장.
 */
@Entity("donation_receipts")
@Index(["year", "memberId"])
export class DonationReceipt {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 30, unique: true, comment: "일련번호 (예: 2026-0001)" })
  receiptNo!: string;

  @Column({ type: "int", comment: "재적 members.id" })
  memberId!: number;

  @Column({ type: "varchar", length: 50, comment: "발급 시점 기부자 성명 스냅샷" })
  donorName!: string;

  /** 주민등록번호 — 발급 시에만 수집, AES-256-GCM 암호화(FINANCE_DATA_KEY) */
  @Column({ type: "text", nullable: true, transformer: encryptedColumn })
  donorRrn!: string | null;

  @Column({ type: "int" })
  year!: number;

  @Column({ type: "decimal", precision: 15, scale: 0 })
  totalAmount!: string;

  @Column({ type: "json", nullable: true, comment: "헌금 종류별 내역 스냅샷" })
  breakdown!: Array<{ name: string; total: number }> | null;

  @Column({ type: "int", comment: "발급자 중앙 users.id" })
  issuedBy!: number;

  @CreateDateColumn()
  issuedAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  canceledAt!: Date | null;

  @Column({ type: "int", nullable: true })
  canceledBy!: number | null;
}
