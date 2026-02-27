import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("popups")
export class Popup {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", nullable: true })
  churchId!: number | null;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "varchar", length: 512, nullable: true })
  imageKey!: string | null;

  @Column({ type: "varchar", length: 1024, nullable: true })
  imageUrl!: string | null;

  @Column({ type: "varchar", length: 1024, nullable: true })
  linkUrl!: string | null;

  @Column({ type: "timestamp", nullable: true })
  startDate!: Date | null;

  @Column({ type: "timestamp", nullable: true })
  endDate!: Date | null;

  @Column({ type: "int", default: 0 })
  isActive!: number;

  @Column({ type: "int" })
  createdBy!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
