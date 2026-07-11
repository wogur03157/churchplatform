import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";

@Entity("content_categories")
@Unique(["parentId", "slug"])
export class ContentCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", nullable: true })
  churchId!: number | null;

  @Column({ type: "int", nullable: true })
  parentId!: number | null;

  @Column({ type: "varchar", length: 120 })
  name!: string;

  @Column({ type: "varchar", length: 120 })
  slug!: string;

  @Column({ type: "tinyint" })
  depth!: 1 | 2 | 3;

  @Column({ type: "int", default: 0 })
  sortOrder!: number;

  @Column({ type: "enum", enum: ["active", "hidden"], default: "active" })
  status!: "active" | "hidden";

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
