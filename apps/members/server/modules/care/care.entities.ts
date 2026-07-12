import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export type VisitationType = "regular" | "hospital" | "new" | "event" | "urgent";
export type VisitationStatus = "requested" | "assigned" | "done" | "canceled";

/**
 * 심방 — 요청/배정/일정은 members 권한으로 관리하고,
 * 수행 기록(content)만 members_sensitive(교역자 전용)로 분리한다.
 */
@Entity("visitations")
export class Visitation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: "int" })
  memberId!: number;

  @Column({ type: "int", nullable: true, comment: "요청자 중앙 users.id" })
  requestedBy!: number | null;

  @Column({ type: "int", nullable: true, comment: "담당 교역자 중앙 users.id" })
  assignedTo!: number | null;

  @Column({
    type: "enum",
    enum: ["regular", "hospital", "new", "event", "urgent"],
    default: "regular",
  })
  type!: VisitationType;

  @Index()
  @Column({
    type: "enum",
    enum: ["requested", "assigned", "done", "canceled"],
    default: "requested",
  })
  status!: VisitationStatus;

  @Column({ type: "date", nullable: true })
  scheduledAt!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true, comment: "요청 사유 (일반 공개)" })
  reason!: string | null;

  /** 심방 수행 기록 — members_sensitive 권한자만 읽기/쓰기 */
  @Column({ type: "text", nullable: true })
  content!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

/** 목양 메모 — 교역자 전용(members_sensitive, allow-list) */
@Entity("pastoral_notes")
export class PastoralNote {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: "int" })
  memberId!: number;

  @Column({ type: "int", comment: "작성자 중앙 users.id" })
  authorId!: number;

  @Column({ type: "text" })
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
