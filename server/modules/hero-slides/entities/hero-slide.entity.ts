import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("hero_slides")
export class HeroSlide {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", nullable: true })
  churchId!: number | null;

  @Column({ type: "enum", enum: ["text", "image_split", "image_bottom", "image"], default: "text" })
  type!: "text" | "image_split" | "image_bottom" | "image";

  @Column({ type: "varchar", length: 255, nullable: true })
  title!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  subtitle!: string | null;

  @Column({ type: "text", nullable: true })
  imageUrl!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  imageKey!: string | null;

  @Column({ type: "int", default: 1 })
  displayOrder!: number;

  @Column({ type: "enum", enum: ["visible", "hidden"], default: "visible" })
  status!: "visible" | "hidden";

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
