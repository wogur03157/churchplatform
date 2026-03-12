import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("page_groups")
export class PageGroup {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ type: "int", nullable: true }) churchId!: number | null;
  @Column({ type: "varchar", length: 100 }) groupKey!: string;
  @Column({ type: "varchar", length: 100 }) name!: string;
  @Column({ type: "varchar", length: 100 }) slug!: string;
  @Column({ type: "text", nullable: true }) description!: string | null;
  @Column({ type: "longtext", nullable: true }) content!: string | null;
  @Column({ type: "varchar", length: 1024, nullable: true }) imageUrl!: string | null;
  @Column({ type: "int", default: 0 }) displayOrder!: number;
  @Column({ type: "enum", enum: ["visible", "hidden"], default: "visible" }) status!: "visible" | "hidden";
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}
