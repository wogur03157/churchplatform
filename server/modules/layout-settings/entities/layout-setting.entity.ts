import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("layoutSettings")
export class LayoutSetting {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "enum",
    enum: ["announcements", "images", "videos", "hero"],
    unique: true,
  })
  sectionType!: "announcements" | "images" | "videos" | "hero";

  @Column({ type: "int", default: 1 })
  isVisible!: number;

  @Column({ type: "int" })
  displayOrder!: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  title!: string | null;

  @Column({ type: "text", nullable: true })
  subtitle!: string | null;

  @Column({ type: "int", nullable: true })
  churchId!: number | null;

  @Column({ type: "int", nullable: true })
  updatedBy!: number | null;

  @UpdateDateColumn()
  updatedAt!: Date;
}
