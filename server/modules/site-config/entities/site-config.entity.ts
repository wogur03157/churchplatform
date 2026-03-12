import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("site_config")
@Unique(["churchId", "key"])
export class SiteConfig {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ type: "int", nullable: true }) churchId!: number | null;
  @Column({ type: "varchar", length: 100 }) key!: string;
  @Column({ type: "text" }) value!: string;
  @Column({ type: "varchar", length: 255, nullable: true }) description!: string | null;
}
