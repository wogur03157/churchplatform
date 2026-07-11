import type { DataSource, EntityTarget, ObjectLiteral } from "typeorm";

/**
 * TenancyModule.forRoot() 옵션 — 앱마다 자기 테넌트 엔티티 목록을 넘긴다.
 * (web은 콘텐츠 엔티티, members는 교인 엔티티, finance는 재정 엔티티)
 */
export interface TenancyModuleOptions {
  /** 이 앱이 테넌트(교회별) DB에서 사용하는 엔티티 목록 */
  tenantEntities: EntityTarget<ObjectLiteral>[];
  /** 프로비저닝 직후 기본 데이터 시드 (선택) */
  seedTenant?: (dataSource: DataSource) => Promise<void>;
}
