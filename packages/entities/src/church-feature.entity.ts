import { Column, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

export type FeatureKey =
  | "announcements"
  | "images"
  | "videos"
  | "floating_messages"
  | "layout_settings"
  | "ai_assistant"
  | "members"
  | "finance";

export const ALL_FEATURES: FeatureKey[] = [
  "announcements",
  "images",
  "videos",
  "floating_messages",
  "layout_settings",
  "ai_assistant",
  "members",
  "finance",
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

  @Column({ type: "enum", enum: ["enabled", "disabled"], default: "enabled" })
  status!: "enabled" | "disabled";

  @Column({ type: "int", nullable: true })
  updatedBy!: number | null;

  @UpdateDateColumn()
  updatedAt!: Date;
}
