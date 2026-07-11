import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("video_categories")
export class VideoCategory {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ type: "int", nullable: true }) churchId!: number | null;
  @Column({ type: "varchar", length: 100 }) name!: string;
  @Column({ type: "varchar", length: 100 }) slug!: string;
  @Column({ type: "tinyint", default: 0 }) isBuiltIn!: number;
  @Column({ type: "int", default: 0 }) displayOrder!: number;
}
