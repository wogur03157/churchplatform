import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export type ExpenseStatus = "pending" | "approved" | "rejected" | "paid" | "voided";

export interface ApprovalEntry {
  approverId: number;
  action: "approve" | "reject";
  at: string;
  comment: string | null;
}

/**
 * 지출결의서 — 기안(pending) → 승인(approved)/반려(rejected) → 지급(paid).
 * 지급된 기록은 불변. 취소(voided)는 지급 전에만 가능하다.
 */
@Entity("expense_requests")
export class ExpenseRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 20, unique: true, comment: "연번 (예: 2026-001)" })
  requestNo!: string;

  @Index()
  @Column({ type: "int" })
  departmentId!: number;

  @Column({ type: "int", comment: "지출 계정과목 accounts.id" })
  accountId!: number;

  @Column({ type: "decimal", precision: 15, scale: 0 })
  amount!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "int", comment: "기안자 중앙 users.id" })
  requestedBy!: number;

  @Index()
  @Column({
    type: "enum",
    enum: ["pending", "approved", "rejected", "paid", "voided"],
    default: "pending",
  })
  status!: ExpenseStatus;

  @Column({ type: "json", nullable: true, comment: "승인/반려 이력" })
  approvals!: ApprovalEntry[] | null;

  @Column({ type: "date", nullable: true })
  paidAt!: string | null;

  @Column({ type: "enum", enum: ["cash", "transfer", "card"], nullable: true })
  paidMethod!: "cash" | "transfer" | "card" | null;

  @Column({ type: "int", nullable: true, comment: "지급 처리자 중앙 users.id" })
  paidBy!: number | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  voidReason!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

/** 영수증 등 증빙 첨부 — 파일은 finance 앱 로컬 uploads에 저장 */
@Entity("expense_attachments")
export class ExpenseAttachment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: "int" })
  expenseRequestId!: number;

  @Column({ type: "varchar", length: 512 })
  fileKey!: string;

  @Column({ type: "varchar", length: 255 })
  fileName!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  mimeType!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
