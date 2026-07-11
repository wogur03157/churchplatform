import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

/**
 * 교인 데이터 감사 로그 (개인정보보호법 대응).
 * 1단계: 생성/수정/삭제 기록. 열람(view) 로깅은 셀프서비스 도입 시 확장.
 */
@Entity("member_audit_logs")
export class MemberAuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: "int", comment: "중앙 DB users.id" })
  actorUserId!: number;

  @Column({ type: "varchar", length: 30 })
  action!: "create" | "update" | "delete" | "export" | "view";

  @Column({ type: "varchar", length: 50 })
  targetType!: string;

  @Column({ type: "int", nullable: true })
  targetId!: number | null;

  @Column({ type: "json", nullable: true, comment: "변경 필드 등 상세 (민감 값 자체는 저장하지 않음)" })
  detail!: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt!: Date;
}
