import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

@Entity("church_admins")
@Unique(["churchId", "userId"])
export class ChurchAdmin {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  churchId!: number;

  @Column({ type: "int" })
  userId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
