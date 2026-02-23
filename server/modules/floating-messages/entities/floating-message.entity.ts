import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("floatingMessages")
export class FloatingMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text" })
  content!: string;

  @Column({
    type: "enum",
    enum: ["info", "warning", "success", "announcement"],
    default: "info",
  })
  messageType!: "info" | "warning" | "success" | "announcement";

  @Column({ type: "int", default: 0 })
  isActive!: number;

  @Column({ type: "timestamp", nullable: true })
  startDate!: Date | null;

  @Column({ type: "timestamp", nullable: true })
  endDate!: Date | null;

  @Column({
    type: "enum",
    enum: ["top", "bottom", "center"],
    default: "center",
  })
  displayPosition!: "top" | "bottom" | "center";

  @Column({ type: "int" })
  createdBy!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
