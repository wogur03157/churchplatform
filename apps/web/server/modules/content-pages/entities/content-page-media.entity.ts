import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ContentPage } from "./content-page.entity";

@Entity("content_page_media")
export class ContentPageMedia {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  pageId!: number;

  @ManyToOne(() => ContentPage, { onDelete: "CASCADE" })
  @JoinColumn({ name: "pageId" })
  page!: ContentPage;

  @Column({ type: "varchar", length: 50 })
  slotKey!: string;

  @Column({ type: "enum", enum: ["image", "video"], default: "image" })
  mediaType!: "image" | "video";

  @Column({ type: "varchar", length: 1024 })
  url!: string;

  @Column({ type: "varchar", length: 1024, nullable: true })
  thumbnailUrl!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  altText!: string | null;

  @Column({ type: "int", default: 0 })
  sortOrder!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
