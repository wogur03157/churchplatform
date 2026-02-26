import { Column, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

export type FeatureKey =
  | "announcements"
  | "images"
  | "videos"
  | "floating_messages"
  | "layout_settings"
  | "ai_assistant";

export const ALL_FEATURES: FeatureKey[] = [
  "announcements",
  "images",
  "videos",
  "floating_messages",
  "layout_settings",
  "ai_assistant",
];

@Entity("church_features")
@Unique(["churchId", "featureKey"])
export class ChurchFeature {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  churchId!: number;

  @Column({ type: "varchar", length: 100 })
  featureKey!: FeatureKey;

  @Column({ type: "int", default: 1 })
  isEnabled!: number;

  @Column({ type: "int", nullable: true })
  updatedBy!: number | null;

  @UpdateDateColumn()
  updatedAt!: Date;
}
