/**
 * 중앙(플랫폼) DB vs 엔티티 스키마 차이 미리보기 — 실행하지 않고 SQL만 출력.
 *
 *   pnpm platform:schema-diff
 *
 * 중앙 DB는 synchronize를 쓰지 않으므로(실데이터 보호), 엔티티에 컬럼/테이블을
 * 추가한 뒤에는 이 스크립트로 차이를 확인하고 필요한 CREATE/ADD만 골라
 * 수동 적용할 것. (DROP·타입변경 구문은 데이터 손실 위험 — 그대로 실행 금지)
 * 테넌트(교회별) DB는 pnpm tenant:migrate가 자동 처리한다.
 */
import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";
import { PLATFORM_ENTITIES } from "../packages/entities/src";
import { Invitation } from "../apps/web/server/modules/invitations/entities/invitation.entity";
import { TENANT_ENTITIES } from "../apps/web/server/tenant-entities";

async function main() {
  const ds = new DataSource({
    type: "mysql",
    url: process.env.DATABASE_URL,
    entities: [...PLATFORM_ENTITIES, Invitation, ...TENANT_ENTITIES],
    synchronize: false,
  });
  await ds.initialize();
  const sqls = await ds.driver.createSchemaBuilder().log();
  for (const q of sqls.upQueries) console.log(q.query + ";");
  await ds.destroy();
}
main().catch((e) => { console.error(e); process.exit(1); });
