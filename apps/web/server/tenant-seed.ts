import type { DataSource } from "typeorm";
import { VideoCategory } from "./modules/video-categories/entities/video-category.entity";

/** 새 테넌트 DB 기본 데이터 — 기본 영상 카테고리 (비어 있을 때만) */
export async function seedTenantDefaults(dataSource: DataSource): Promise<void> {
  const categoryRepo = dataSource.getRepository(VideoCategory);
  if ((await categoryRepo.count()) > 0) return;

  await categoryRepo.save([
    categoryRepo.create({ name: "주일예배", slug: "sunday", isBuiltIn: 1, displayOrder: 1 }),
    categoryRepo.create({ name: "수요예배", slug: "wednesday", isBuiltIn: 1, displayOrder: 2 }),
    categoryRepo.create({ name: "금요예배", slug: "friday", isBuiltIn: 1, displayOrder: 3 }),
  ]);
}
