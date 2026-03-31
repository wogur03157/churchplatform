import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ContentCategory } from "./content-category.entity";

export type ContentTemplateCode = "hero" | "gallery" | "board" | "content";

@Entity("content_pages")
export class ContentPage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  categoryId!: number;

  @ManyToOne(() => ContentCategory, { onDelete: "CASCADE" })
  @JoinColumn({ name: "categoryId" })
  category!: ContentCategory;

  @Column({ type: "int", nullable: true })
  churchId!: number | null;

  @Column({
    type: "enum",
    enum: ["hero", "gallery", "board", "content"],
    default: "content",
  })
  templateCode!: ContentTemplateCode;

  @Column({ type: "varchar", length: 200 })
  title!: string;

  @Column({ type: "longtext", nullable: true })
  content!: string | null;

  @Column({ type: "enum", enum: ["published", "draft"], default: "draft" })
  status!: "published" | "draft";

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
