import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/** 회계연도 — 연 단위 마감의 기준 */
@Entity("fiscal_years")
export class FiscalYear {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", unique: true })
  year!: number;

  @Column({ type: "enum", enum: ["open", "closed"], default: "open" })
  status!: "open" | "closed";

  /** 전년도 이월 잔액 (KRW 정수) */
  @Column({ type: "decimal", precision: 15, scale: 0, default: 0 })
  openingBalance!: string;

  @Column({ type: "timestamp", nullable: true })
  closedAt!: Date | null;

  @Column({ type: "int", nullable: true, comment: "마감자 중앙 users.id" })
  closedBy!: number | null;
}

/** 부서/위원회 — 지출 예산의 단위 */
@Entity("departments")
export class Department {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "int", default: 0 })
  displayOrder!: number;

  @Column({ type: "tinyint", default: 0 })
  isBuiltIn!: number;

  @Column({ type: "enum", enum: ["active", "archived"], default: "active" })
  status!: "active" | "archived";
}

/** 계정과목 — 수입(헌금 종류)/지출 항목 */
@Entity("accounts")
export class Account {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "enum", enum: ["income", "expense"] })
  kind!: "income" | "expense";

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "int", nullable: true, comment: "지출 항목의 소속 부서" })
  departmentId!: number | null;

  @Column({ type: "int", default: 0 })
  displayOrder!: number;

  @Column({ type: "tinyint", default: 0 })
  isBuiltIn!: number;

  @Column({ type: "enum", enum: ["active", "archived"], default: "active" })
  status!: "active" | "archived";
}

/** 재정 앱 설정 (key-value) — 예: transparency_enabled */
@Entity("finance_config")
export class FinanceConfig {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100, unique: true })
  key!: string;

  @Column({ type: "text" })
  value!: string;
}
