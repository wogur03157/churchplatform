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
 * CREATE TABLE `home_ministry_items` (
 *   `id` int NOT NULL AUTO_INCREMENT,
 *   `churchId` int DEFAULT NULL,
 *   `title` varchar(255) NOT NULL,
 *   `description` text DEFAULT NULL,
 *   `imageUrl` varchar(500) DEFAULT NULL,
 *   `imageKey` varchar(500) DEFAULT NULL,
 *   `displayOrder` int NOT NULL DEFAULT 0,
 *   `status` enum('active','inactive') NOT NULL DEFAULT 'active',
 *   `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 *   `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
 *   PRIMARY KEY (`id`)
 * );
 */
@Entity("home_ministry_items")
export class HomeMinistryItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", nullable: true })
  churchId!: number | null;

  @Column({ type: "varchar", length: 255 })
  title!: string;

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

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
