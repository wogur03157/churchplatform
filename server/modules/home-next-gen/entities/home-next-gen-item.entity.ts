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
 * CREATE TABLE `home_next_gen_items` (
 *   `id` int NOT NULL AUTO_INCREMENT,
 *   `churchId` int DEFAULT NULL,
 *   `title` varchar(255) NOT NULL,
 *   `subtitle` varchar(255) DEFAULT NULL,
 *   `targetAge` varchar(255) DEFAULT NULL,
 *   `worshipTime` varchar(255) DEFAULT NULL,
 *   `location` varchar(255) DEFAULT NULL,
 *   `description` text DEFAULT NULL,
 *   `imageUrl` varchar(500) DEFAULT NULL,
 *   `imageKey` varchar(500) DEFAULT NULL,
 *   `displayOrder` int NOT NULL DEFAULT 0,
 *   `status` enum('active','inactive') NOT NULL DEFAULT 'active',
 *   `motto` text DEFAULT NULL,
 *   `scheduleJson` json DEFAULT NULL,
 *   `calendarJson` json DEFAULT NULL,
 *   `staffInfo` varchar(500) DEFAULT NULL,
 *   `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 *   `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
 *   PRIMARY KEY (`id`)
 * );
 */
@Entity("home_next_gen_items")
export class HomeNextGenItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", nullable: true })
  churchId!: number | null;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  subtitle!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  targetAge!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  worshipTime!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  location!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  imageUrl!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  imageKey!: string | null;

  @Column({ type: "int", default: 0 })
  displayOrder!: number;

  @Column({ type: "enum", enum: ["active", "inactive"], default: "active" })
  status!: "active" | "inactive";

  @Column({ type: "text", nullable: true })
  motto!: string | null;

  @Column({ type: "json", nullable: true })
  scheduleJson!: any | null;

  @Column({ type: "json", nullable: true })
  calendarJson!: any | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  staffInfo!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
