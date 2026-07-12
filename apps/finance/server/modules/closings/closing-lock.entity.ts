import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

/**
 * 마감 잠금 — 잠긴 월(연)에는 금전 기록의 생성·취소·확정이 차단된다.
 * month가 NULL이면 연 마감.
 */
@Entity("closing_locks")
@Unique(["year", "month"])
export class ClosingLock {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  year!: number;

  @Column({ type: "int", nullable: true, comment: "NULL = 연 마감" })
  month!: number | null;

  @Column({ type: "int", comment: "마감자 중앙 users.id" })
  lockedBy!: number;

  @CreateDateColumn()
  lockedAt!: Date;
}
