import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

/** 재정 감사 로그 — 모든 금전 기록의 생성/확정/취소를 남긴다 */
@Entity("finance_audit_logs")
export class FinanceAuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: "int", comment: "중앙 users.id" })
  actorUserId!: number;

  @Column({ type: "varchar", length: 30 })
  action!: string;

  @Column({ type: "varchar", length: 50 })
  targetType!: string;

  @Column({ type: "int", nullable: true })
  targetId!: number | null;

  @Column({ type: "json", nullable: true })
  detail!: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt!: Date;
}
