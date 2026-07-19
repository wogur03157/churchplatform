import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { encryptedColumn } from "../../lib/encrypted-column";

export type BaptismLevel =
  | "visitor" // 방문
  | "wonip" // 원입
  | "haksup" // 학습
  | "baptized" // 세례
  | "confirmed" // 입교
  | "infant"; // 유아세례

export type MemberStatus =
  | "active" // 출석
  | "absent_long" // 장기결석
  | "transferred" // 이명
  | "deceased" // 별세
  | "removed"; // 제적

export type FamilyRole = "head" | "spouse" | "child" | "parent" | "etc";

@Entity("members")
export class Member {
  @PrimaryGeneratedColumn()
  id!: number;

  /** 중앙 DB users.id — 홈페이지 계정 연동(셀프서비스) 시 연결 */
  @Column({ type: "int", nullable: true })
  userId!: number | null;

  /** 교적번호 — 교회 내 유일. 동명이인 식별용. 등록 시 자동 발번(수정 가능) */
  @Index({ unique: true })
  @Column({ type: "varchar", length: 30, nullable: true })
  code!: string | null;

  @Index()
  @Column({ type: "varchar", length: 50 })
  name!: string;

  @Column({ type: "varchar", length: 1024, nullable: true })
  photoUrl!: string | null;

  @Column({ type: "enum", enum: ["m", "f"], nullable: true })
  gender!: "m" | "f" | null;

  @Column({ type: "date", nullable: true })
  birthDate!: string | null;

  @Column({ type: "tinyint", default: 0 })
  isLunarBirth!: number;

  /** 암호화 저장 (MEMBER_DATA_KEY) */
  @Column({ type: "text", nullable: true, transformer: encryptedColumn })
  phone!: string | null;

  /** 암호화 저장 (MEMBER_DATA_KEY) */
  @Column({ type: "text", nullable: true, transformer: encryptedColumn })
  address!: string | null;

  @Column({ type: "varchar", length: 320, nullable: true })
  email!: string | null;

  @Column({
    type: "enum",
    enum: ["visitor", "wonip", "haksup", "baptized", "confirmed", "infant"],
    nullable: true,
  })
  baptismLevel!: BaptismLevel | null;

  @Column({ type: "date", nullable: true })
  baptizedAt!: string | null;

  @Column({ type: "int", nullable: true })
  positionId!: number | null;

  @Index()
  @Column({
    type: "enum",
    enum: ["active", "absent_long", "transferred", "deceased", "removed"],
    default: "active",
  })
  status!: MemberStatus;

  @Index()
  @Column({ type: "int", nullable: true })
  familyId!: number | null;

  @Column({ type: "enum", enum: ["head", "spouse", "child", "parent", "etc"], nullable: true })
  familyRole!: FamilyRole | null;

  @Column({ type: "date", nullable: true })
  registeredAt!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true, comment: "등록 경로(지인 소개/전도 등)" })
  registerPath!: string | null;

  /** 일반 메모 — 관리자 공유. 목양 메모는 별도 테이블(2단계, 교역자 전용) */
  @Column({ type: "text", nullable: true })
  memo!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
