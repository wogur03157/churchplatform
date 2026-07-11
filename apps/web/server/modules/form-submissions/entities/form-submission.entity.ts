import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("form_submissions")
export class FormSubmission {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ type: "int", nullable: true }) churchId!: number | null;
  @Column({ type: "varchar", length: 50, nullable: true }) formType!: string | null;
  @Column({ type: "json" }) fieldData!: Record<string, string>;
  @CreateDateColumn() submittedAt!: Date;
}
