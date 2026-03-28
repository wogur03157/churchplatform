import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("layout_settings")
export class LayoutSetting {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "enum",
    enum: ["announcements", "images", "videos", "hero", "image_a", "image_b"],
  })
  sectionType!: "announcements" | "images" | "videos" | "hero" | "image_a" | "image_b";

  @Column({ type: "enum", enum: ["visible", "hidden"], default: "visible" })
  status!: "visible" | "hidden";

  @Column({ type: "int" })
  displayOrder!: number;

  @Column({ type: "int", default: 1 })
  colSpan!: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  title!: string | null;

  @Column({ type: "text", nullable: true })
  subtitle!: string | null;

  @Column({ type: "varchar", length: 512, nullable: true })
  imageKey!: string | null;

  @Column({ type: "varchar", length: 1024, nullable: true })
  imageUrl!: string | null;

  @Column({ type: "int", nullable: true, default: null })
  gridCols!: number | null;

  @Column({ type: "int", nullable: true })
  churchId!: number | null;

  @Column({ type: "int", nullable: true })
  updatedBy!: number | null;

  @UpdateDateColumn()
  updatedAt!: Date;
}
