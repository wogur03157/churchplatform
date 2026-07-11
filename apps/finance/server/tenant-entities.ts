import type { EntitySchema } from "typeorm";

/**
 * 재정 앱의 테넌트(교회별) DB 엔티티 목록.
 *
 * 기획서(z_docs/plan-finance.md)의 accounts, offerings, expense_requests,
 * ledger_entries 등을 구현하면서 여기에 추가한다.
 * 추가 후에는 scripts/tenants.ts의 APPS 배열에도 반영할 것.
 */
export const TENANT_ENTITIES: (Function | EntitySchema)[] = [];
