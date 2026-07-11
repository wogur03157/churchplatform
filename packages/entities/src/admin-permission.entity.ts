import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

/**
 * 관리자 개인 단위 메뉴/기능 접근 권한 (중앙 DB).
 * 행이 없으면 허용 — denied 행이 있을 때만 차단한다.
 * permKey 예: members | members_sensitive | finance | finance_approve
 */
@Entity("admin_permissions")
@Unique(["adminId", "permKey"])
export class AdminPermission {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", comment: "users.id (church_admin role)" })
  adminId!: number;

  @Column({ type: "varchar", length: 100 })
  permKey!: string;

  @Column({ type: "enum", enum: ["allowed", "denied"], default: "allowed" })
  status!: "allowed" | "denied";
}
