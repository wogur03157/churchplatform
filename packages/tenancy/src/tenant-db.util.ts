import type { DataSourceOptions, EntityTarget, ObjectLiteral } from "typeorm";

/** slug → 안전한 MySQL database 이름 (`church_` prefix, 영숫자/언더스코어만) */
export function tenantDbNameFromSlug(slug: string): string {
  const safe = slug.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 48);
  return `church_${safe}`;
}

/** 중앙 DATABASE_URL에서 database 이름만 교체한 접속 URL 생성 */
export function buildTenantDbUrl(dbName: string): string {
  const url = new URL(process.env.DATABASE_URL ?? "");
  url.pathname = `/${dbName}`;
  return url.toString();
}

/** 테넌트 DataSource 공통 옵션 — 엔티티 목록은 앱별로 주입 */
export function tenantDataSourceOptions(
  dbName: string,
  entities: EntityTarget<ObjectLiteral>[],
  overrides: Partial<DataSourceOptions> = {}
): DataSourceOptions {
  return {
    type: "mysql",
    url: buildTenantDbUrl(dbName),
    entities: [...entities],
    synchronize: false,
    ...overrides,
  } as DataSourceOptions;
}
