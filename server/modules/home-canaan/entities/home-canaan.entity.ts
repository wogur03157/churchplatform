import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

/**
 * SQL to create this table (single-row per church):
 *
 * CREATE TABLE `home_canaan` (
 *   `id` int NOT NULL AUTO_INCREMENT,
 *   `churchId` int DEFAULT NULL,
 *   `backgroundImageUrl` varchar(500) DEFAULT NULL,
 *   `backgroundImageKey` varchar(500) DEFAULT NULL,
 *   `title` varchar(255) DEFAULT NULL,
 *   `description` text DEFAULT NULL,
 *   `button1Text` varchar(100) DEFAULT NULL,
 *   `button1Link` varchar(500) DEFAULT NULL,
 *   `button2Text` varchar(100) DEFAULT NULL,
 *   `button2Link` varchar(500) DEFAULT NULL,
 *   `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 *   `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
 *   PRIMARY KEY (`id`)
 * );
 */
@Entity("home_canaan")
export class HomeCanaan {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", nullable: true })
  churchId!: number | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  backgroundImageUrl!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  backgroundImageKey!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  title!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  button1Text!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  button1Link!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  button2Text!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  button2Link!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
