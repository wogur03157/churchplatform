import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from "typeorm";

/** 출석 세션(예배/모임 종류) — 주일 1부, 수요예배, 셀모임 등 */
@Entity("attendance_sessions")
export class AttendanceSession {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "int", nullable: true, comment: "조직 모임이면 member_groups.id" })
  groupId!: number | null;

  @Column({ type: "int", default: 0 })
  displayOrder!: number;

  @Column({ type: "tinyint", default: 0 })
  isBuiltIn!: number;
}

export type AttendanceStatus = "present" | "absent" | "online";

/** 출석 기록 — (세션, 교인, 날짜) 단위 upsert */
@Entity("attendance_records")
@Unique(["sessionId", "memberId", "date"])
export class AttendanceRecord {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: "int" })
  sessionId!: number;

  @Index()
  @Column({ type: "int" })
  memberId!: number;

  @Index()
  @Column({ type: "date" })
  date!: string;

  @Column({ type: "enum", enum: ["present", "absent", "online"], default: "present" })
  status!: AttendanceStatus;

  @Column({ type: "int", nullable: true, comment: "체크한 관리자 users.id" })
  checkedBy!: number | null;
}
