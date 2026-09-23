import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

/**
 * SQL to create this table:
 *
 * CREATE TABLE `home_worship_schedule` (
 *   `id` int NOT NULL AUTO_INCREMENT,
 *   `churchId` int DEFAULT NULL,
 *   `name` varchar(255) NOT NULL,
 *   `time` varchar(100) NOT NULL,
 *   `location` varchar(255) DEFAULT NULL,
 *   `displayOrder` int NOT NULL DEFAULT 0,
 *   `status` enum('active','inactive') NOT NULL DEFAULT 'active',
 *   `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 *   `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
 *   PRIMARY KEY (`id`)
 * );
 */
@Entity("home_worship_schedule")
export class HomeWorshipSchedule {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", nullable: true })
  churchId!: number | null;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 100 })
  time!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  location!: string | null;

  @Column({ type: "int", default: 0 })
  displayOrder!: number;

  @Column({ type: "enum", enum: ["active", "inactive"], default: "active" })
  status!: "active" | "inactive";

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
