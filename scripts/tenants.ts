/**
 * 테넌트(교회별) DB 관리 CLI
 *
 *   pnpm tenant:provision <slug>   특정 교회 프로비저닝 (DB 생성 + 스키마 + 시드)
 *   pnpm tenant:provision --all    active인데 아직 dbName 없는 교회 전부 프로비저닝
 *   pnpm tenant:migrate            프로비저닝된 모든 교회 DB에 스키마 동기화
 *
 * 주의: 스키마 동기화는 TypeORM synchronize를 사용합니다. 컬럼 타입 변경·삭제가
 * 포함된 엔티티 수정은 데이터 손실이 가능하니, 반드시 백업 후 실행하세요.
 */
import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";
import { Church } from "../server/modules/churches/entities/church.entity";
import { VideoCategory } from "../server/modules/video-categories/entities/video-category.entity";
import {
  tenantDataSourceOptions,
  tenantDbNameFromSlug,
} from "../server/modules/tenancy/tenant-db.util";

function createPlatformDataSource(): DataSource {
  const url = process.env.DATABASE_URL ?? "";
  if (!url) {
    console.error("DATABASE_URL이 설정되어 있지 않습니다 (.env 확인)");
    process.exit(1);
  }
  return new DataSource({ type: "mysql", url, entities: [Church] });
}

async function syncTenantSchema(dbName: string): Promise<void> {
  const ds = new DataSource(tenantDataSourceOptions(dbName));
  await ds.initialize();
  try {
    await ds.synchronize();
    await seedDefaults(ds);
  } finally {
    await ds.destroy();
  }
}

async function seedDefaults(ds: DataSource): Promise<void> {
  const repo = ds.getRepository(VideoCategory);
  if ((await repo.count()) > 0) return;
  await repo.save([
    repo.create({ name: "주일예배", slug: "sunday", isBuiltIn: 1, displayOrder: 1 }),
    repo.create({ name: "수요예배", slug: "wednesday", isBuiltIn: 1, displayOrder: 2 }),
    repo.create({ name: "금요예배", slug: "friday", isBuiltIn: 1, displayOrder: 3 }),
  ]);
}

async function provisionChurch(platform: DataSource, church: Church): Promise<void> {
  const dbName = church.dbName ?? tenantDbNameFromSlug(church.slug);
  console.log(`▶ ${church.slug} → ${dbName}`);

  await platform.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await syncTenantSchema(dbName);

  if (church.dbName !== dbName) {
    church.dbName = dbName;
    await platform.getRepository(Church).save(church);
  }
  console.log(`  ✔ 완료`);
}

async function main(): Promise<void> {
  const [command, target] = process.argv.slice(2);
  const platform = createPlatformDataSource();
  await platform.initialize();

  try {
    const churchRepo = platform.getRepository(Church);

    if (command === "provision") {
      if (!target) {
        console.error("사용법: pnpm tenant:provision <slug> 또는 --all");
        process.exit(1);
      }
      const churches =
        target === "--all"
          ? (await churchRepo.find({ where: { status: "active" } })).filter((c) => !c.dbName)
          : await churchRepo.find({ where: { slug: target } });

      if (churches.length === 0) {
        console.log("프로비저닝할 교회가 없습니다.");
        return;
      }
      for (const church of churches) await provisionChurch(platform, church);
    } else if (command === "migrate") {
      const churches = await churchRepo.find();
      const provisioned = churches.filter((c) => c.dbName);
      console.log(`프로비저닝된 교회 ${provisioned.length}곳에 스키마 동기화 실행`);
      for (const church of provisioned) {
        console.log(`▶ ${church.slug} (${church.dbName})`);
        await syncTenantSchema(church.dbName!);
        console.log(`  ✔ 완료`);
      }
    } else {
      console.error("사용법: tsx scripts/tenants.ts <provision|migrate> [slug|--all]");
      process.exit(1);
    }
  } finally {
    await platform.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
