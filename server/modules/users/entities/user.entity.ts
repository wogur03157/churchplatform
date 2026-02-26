import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 64, unique: true })
  openId!: string;

  @Column({ type: "text", nullable: true })
  name!: string | null;

  @Column({ type: "varchar", length: 320, nullable: true })
  email!: string | null;

  @Column({ type: "varchar", length: 64, nullable: true })
  loginMethod!: string | null;

  @Column({
    type: "enum",
    enum: ["user", "church_admin", "super_admin"],
    default: "user",
  })
  role!: "user" | "church_admin" | "super_admin";

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  lastSignedIn!: Date;
}
