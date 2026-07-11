import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

/** 가족 단위 묶음 — members.familyId가 이 테이블을 참조 */
@Entity("families")
export class Family {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", nullable: true, comment: "세대주 members.id" })
  headMemberId!: number | null;

  @Column({ type: "varchar", length: 100, nullable: true, comment: "가족 표시명 (예: 김철수 가정)" })
  label!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
