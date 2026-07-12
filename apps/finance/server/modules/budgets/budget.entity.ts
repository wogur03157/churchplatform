import { Column, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

/** 연간 예산 — 지출 계정과목 단위 (부서는 계정에 연결돼 있음) */
@Entity("budgets")
@Unique(["year", "accountId"])
export class Budget {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  year!: number;

  @Column({ type: "int", comment: "지출 계정과목 accounts.id" })
  accountId!: number;

  @Column({ type: "decimal", precision: 15, scale: 0 })
  amount!: string;

  @Column({ type: "int", nullable: true, comment: "최종 수정자 중앙 users.id" })
  updatedBy!: number | null;

  @UpdateDateColumn()
  updatedAt!: Date;
}
