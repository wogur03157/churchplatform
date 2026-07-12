import type { EntitySchema } from "typeorm";
import { AttendanceRecord, AttendanceSession } from "./modules/attendance/attendance.entity";
import { MemberAuditLog } from "./modules/audit/member-audit-log.entity";
import { PastoralNote, Visitation } from "./modules/care/care.entities";
import { Family } from "./modules/families/family.entity";
import { MemberGroup, MemberGroupMember } from "./modules/groups/member-group.entity";
import { Member } from "./modules/members/member.entity";
import { NewcomerProgress, NewcomerStage } from "./modules/newcomers/newcomer.entity";
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
  MemberGroup,
  MemberGroupMember,
  AttendanceSession,
  AttendanceRecord,
  NewcomerStage,
  NewcomerProgress,
  Visitation,
  PastoralNote,
];
