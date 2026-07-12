import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from "typeorm";

export type GroupType = "parish" | "cell" | "department" | "team";

/** 조직 트리 — 교구 > 구역 > 셀, 부서, 찬양대/봉사팀 등 */
@Entity("member_groups")
export class MemberGroup {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: "int", nullable: true })
  parentId!: number | null;

  @Column({ type: "enum", enum: ["parish", "cell", "department", "team"], default: "cell" })
  type!: GroupType;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "int", nullable: true, comment: "리더 members.id" })
  leaderMemberId!: number | null;

  @Column({ type: "int", default: 0 })
  displayOrder!: number;

  @Column({ type: "enum", enum: ["active", "archived"], default: "active" })
  status!: "active" | "archived";
}

/** 조직-교인 소속 (한 교인이 여러 조직 가능) */
@Entity("member_group_members")
@Unique(["groupId", "memberId"])
export class MemberGroupMember {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: "int" })
  groupId!: number;

  @Index()
  @Column({ type: "int" })
  memberId!: number;

  @Column({ type: "enum", enum: ["leader", "member"], default: "member" })
  role!: "leader" | "member";
}
