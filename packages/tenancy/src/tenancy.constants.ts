/** 요청 스코프로 제공되는 교회별 DataSource 주입 토큰 */
export const TENANT_DATASOURCE = Symbol("TENANT_DATASOURCE");

/** TenancyModule.forRoot() 옵션 주입 토큰 */
export const TENANCY_MODULE_OPTIONS = Symbol("TENANCY_MODULE_OPTIONS");
