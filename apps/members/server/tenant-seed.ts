import type { DataSource } from "typeorm";
import { Position } from "./modules/positions/position.entity";

/** 새 테넌트 DB 기본 데이터 — 기본 직분 (비어 있을 때만) */
export async function seedTenantDefaults(dataSource: DataSource): Promise<void> {
  const positionRepo = dataSource.getRepository(Position);
  if ((await positionRepo.count()) > 0) return;

  const defaults = ["성도", "서리집사", "안수집사", "권사", "장로", "전도사", "목사"];
  await positionRepo.save(
    defaults.map((name, index) =>
      positionRepo.create({ name, displayOrder: index + 1, isBuiltIn: 1 })
    )
  );
}
