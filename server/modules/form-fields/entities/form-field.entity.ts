import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("form_fields")
export class FormField {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ type: "int", nullable: true }) churchId!: number | null;
  @Column({ type: "varchar", length: 50 }) fieldType!: "text" | "number" | "textarea" | "dropdown" | "checkbox" | "radio";
  @Column({ type: "varchar", length: 255 }) label!: string;
  @Column({ type: "varchar", length: 255, nullable: true }) placeholder!: string | null;
  @Column({ type: "tinyint", default: 0 }) required!: number;
  @Column({ type: "json", nullable: true }) options!: string[] | null;
  @Column({ type: "enum", enum: ["text", "none"], default: "none" }) allowOther!: "text" | "none";
  @Column({ type: "int", default: 0 }) displayOrder!: number;
  @Column({ type: "enum", enum: ["active", "inactive"], default: "active" }) status!: "active" | "inactive";
}
