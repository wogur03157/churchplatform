import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/** 직분 — 교회별 커스텀 가능, 기본 세트는 시드로 제공 */
@Entity("positions")
export class Position {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 50 })
  name!: string;

  @Column({ type: "int", default: 0 })
  displayOrder!: number;

  @Column({ type: "tinyint", default: 0, comment: "기본 직분은 삭제 불가" })
  isBuiltIn!: number;
}
