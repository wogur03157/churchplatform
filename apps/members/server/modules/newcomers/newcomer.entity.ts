import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

/** 새가족 정착 단계 (커스텀 가능) — 기본: 등록 → 새가족반 → 수료 → 정착 */
@Entity("newcomer_stages")
export class NewcomerStage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 50 })
  name!: string;

  @Column({ type: "int", default: 0 })
  displayOrder!: number;

  @Column({ type: "tinyint", default: 0 })
  isBuiltIn!: number;

  @Column({ type: "tinyint", default: 0, comment: "이 단계 도달 시 정착 완료 처리" })
  isFinal!: number;
}

/** 새가족의 현재 단계 (칸반 카드) */
@Entity("newcomer_progress")
export class NewcomerProgress {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ type: "int" })
  memberId!: number;

  @Index()
  @Column({ type: "int" })
  stageId!: number;

  @Column({ type: "int", nullable: true, comment: "담당자 users.id" })
  assignedTo!: number | null;

  @Column({ type: "date", nullable: true, comment: "현재 단계 진입일" })
  enteredStageAt!: string | null;

  @Column({ type: "text", nullable: true })
  note!: string | null;

  @Column({ type: "date", nullable: true, comment: "정착 완료일 (최종 단계 도달)" })
  completedAt!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
