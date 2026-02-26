import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("announcements")
export class Announcement {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text" })
  content!: string;

  @Column({ type: "int", nullable: true })
  churchId!: number | null;

  @Column({ type: "int" })
  authorId!: number;

  @Column({ type: "int", default: 0 })
  isPublished!: number;

  @Column({ type: "timestamp", nullable: true })
  publishedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
