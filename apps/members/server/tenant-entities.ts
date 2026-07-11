import type { EntitySchema } from "typeorm";
import { MemberAuditLog } from "./modules/audit/member-audit-log.entity";
import { Family } from "./modules/families/family.entity";
import { Member } from "./modules/members/member.entity";
import { Position } from "./modules/positions/position.entity";

/**
 * 재적 앱의 테넌트(교회별) DB 엔티티 목록.
 * 여기 추가하면 scripts/tenants.ts(APPS)에도 반영할 것.
 */
export const TENANT_ENTITIES: (Function | EntitySchema)[] = [
  Member,
  Family,
  Position,
  MemberAuditLog,
];
