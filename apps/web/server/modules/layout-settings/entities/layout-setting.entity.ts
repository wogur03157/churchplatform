import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export const LAYOUT_SECTION_TYPES = [
  "announcements",
  "images",
  "videos",
  "hero",
  "image_a",
  "image_b",
  "content_category",
  "media_category",
] as const;

export type LayoutSectionType = (typeof LAYOUT_SECTION_TYPES)[number];

export const LAYOUT_DISPLAY_VARIANTS = [
  "grid",
  "list",
  "featured",
  "links",
] as const;

export type LayoutDisplayVariant = (typeof LAYOUT_DISPLAY_VARIANTS)[number];

@Entity("layout_settings")
export class LayoutSetting {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "enum",
    enum: LAYOUT_SECTION_TYPES,
  })
  sectionType!: LayoutSectionType;

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

  @Column({ type: "int", nullable: true, default: null })
  sourceCategoryId!: number | null;

  @Column({ type: "int", nullable: true, default: null })
  itemLimit!: number | null;

  @Column({
    type: "enum",
    enum: LAYOUT_DISPLAY_VARIANTS,
    nullable: true,
    default: null,
  })
  displayVariant!: LayoutDisplayVariant | null;

  @Column({ type: "int", nullable: true })
  churchId!: number | null;

  @Column({ type: "int", nullable: true })
  updatedBy!: number | null;

  @UpdateDateColumn()
  updatedAt!: Date;
}
