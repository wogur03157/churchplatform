import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export type ChurchStatus = "pending" | "active" | "suspended" | "rejected";

@Entity("churches")
export class Church {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  slug!: string;

  @Column({ type: "enum", enum: ["pending", "active", "suspended", "rejected"], default: "pending" })
  status!: ChurchStatus;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "varchar", length: 512, nullable: true })
  logoUrl!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  address!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  phone!: string | null;

  @Column({ type: "varchar", length: 320, nullable: true })
  email!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  customDomain!: string | null;

  @Column({ type: "int", nullable: true })
  appliedBy!: number | null;

  @Column({ type: "int", nullable: true })
  approvedBy!: number | null;

  @Column({ type: "timestamp", nullable: true })
  approvedAt!: Date | null;

  @Column({ type: "text", nullable: true })
  rejectedReason!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
