import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("images")
export class Image {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "varchar", length: 512 })
  fileKey!: string;

  @Column({ type: "varchar", length: 1024 })
  url!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  mimeType!: string | null;

  @Column({ type: "int", nullable: true })
  fileSize!: number | null;

  @Column({ type: "int", nullable: true })
  churchId!: number | null;

  @Column({ type: "int" })
  uploadedBy!: number;

  @Column({ type: "enum", enum: ["published", "draft"], default: "draft" })
  status!: "published" | "draft";

  @Column({ type: "int", default: 0 })
  displayOrder!: number;

  @Column({ type: "tinyint", width: 1, default: 0 })
  showOnHome!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
