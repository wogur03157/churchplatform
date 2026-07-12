import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

/**
 * 관리자 개인 단위 메뉴/기능 접근 권한 (중앙 DB).
 * 행이 없으면 허용 — denied 행이 있을 때만 차단한다 (민감 권한은 allow-list).
 * churchId 단위로 스코프되며, NULL이면 전 교회 공통(글로벌) 권한.
 * permKey 예: members | members_sensitive | finance | finance_approve
 */
@Entity("admin_permissions")
@Unique(["adminId", "permKey", "churchId"])
export class AdminPermission {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", comment: "users.id (church_admin role)" })
  adminId!: number;

  @Column({ type: "int", nullable: true, comment: "권한이 유효한 교회 — NULL은 전 교회 공통" })
  churchId!: number | null;

  @Column({ type: "varchar", length: 100 })
  permKey!: string;

  @Column({ type: "enum", enum: ["allowed", "denied"], default: "allowed" })
  status!: "allowed" | "denied";
}
