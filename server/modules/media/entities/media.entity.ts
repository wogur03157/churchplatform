import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ContentCategory } from "../../content-pages/entities/content-category.entity";

export type MediaType = "image" | "video";
export type MediaVideoType = "upload" | "youtube" | "vimeo" | "url";

@Entity("media")
export class Media {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 20, nullable: true })
  legacySource!: "videos" | "images" | null;

  @Column({ type: "int", nullable: true })
  legacyId!: number | null;

  @Column({ type: "int", nullable: true })
  churchId!: number | null;

  @Column({ type: "int", nullable: true })
  categoryId!: number | null;

  @ManyToOne(() => ContentCategory, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "categoryId" })
  category!: ContentCategory | null;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "enum", enum: ["image", "video"] })
  mediaType!: MediaType;

  @Column({
    type: "enum",
    enum: ["upload", "youtube", "vimeo", "url"],
    nullable: true,
  })
  videoType!: MediaVideoType | null;

  @Column({ type: "varchar", length: 512, nullable: true })
  fileKey!: string | null;

  @Column({ type: "varchar", length: 1024 })
  url!: string;

  @Column({ type: "varchar", length: 1024, nullable: true })
  thumbnailUrl!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  mimeType!: string | null;

  @Column({ type: "int", nullable: true })
  fileSize!: number | null;

  @Column({ type: "int", nullable: true })
  duration!: number | null;

  @Column({ type: "int" })
  uploadedBy!: number;

  @Column({ type: "enum", enum: ["published", "draft"], default: "draft" })
  status!: "published" | "draft";

  @Column({ type: "int", default: 0 })
  displayOrder!: number;

  @Column({ type: "tinyint", width: 1, default: 0 })
  showOnHome!: boolean;

  @Column({ type: "varchar", length: 255, nullable: true })
  altText!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
