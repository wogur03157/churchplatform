import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("videos")
export class Video {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({
    type: "enum",
    enum: ["upload", "youtube", "vimeo", "url"],
  })
  videoType!: "upload" | "youtube" | "vimeo" | "url";

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

  @Column({ type: "int", nullable: true })
  churchId!: number | null;

  @Column({ type: "int" })
  uploadedBy!: number;

  @Column({ type: "enum", enum: ["published", "draft"], default: "draft" })
  status!: "published" | "draft";

  @Column({ type: "int", default: 0 })
  displayOrder!: number;

  @Column({ type: "varchar", length: 100, nullable: true })
  category!: string | null;

  /**
   * 설교 본문 (성경 구절 참조, 예: "요한복음 4:14")
   * ALTER TABLE videos ADD COLUMN scripture varchar(255) DEFAULT NULL;
   */
  @Column({ type: "varchar", length: 255, nullable: true })
  scripture!: string | null;

  /**
   * 설교 날짜 (예배 날짜, 예: "2024-11-03")
   * ALTER TABLE videos ADD COLUMN sermon_date date DEFAULT NULL;
   */
  @Column({ type: "date", nullable: true })
  sermonDate!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
