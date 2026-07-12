import type { EntitySchema } from "typeorm";
import { FinanceAuditLog } from "./modules/audit/finance-audit-log.entity";
import { Offering, OfferingBatch } from "./modules/offerings/offerings.entities";
import { Account, Department, FiscalYear } from "./modules/settings/settings.entities";

/**
 * 재정 앱의 테넌트(교회별) DB 엔티티 목록.
 * 여기 추가하면 scripts/tenants.ts(APPS)에도 반영할 것.
 */
export const TENANT_ENTITIES: (Function | EntitySchema)[] = [
  FiscalYear,
  Department,
  Account,
  OfferingBatch,
  Offering,
  FinanceAuditLog,
];
