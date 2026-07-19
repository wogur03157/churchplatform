import { IsNull, type DataSource } from "typeorm";
import { AttendanceSession } from "./modules/attendance/attendance.entity";
import { Member } from "./modules/members/member.entity";
import { NewcomerStage } from "./modules/newcomers/newcomer.entity";
import { Position } from "./modules/positions/position.entity";

/** 새 테넌트 DB 기본 데이터 (각 테이블이 비어 있을 때만) */
export async function seedTenantDefaults(dataSource: DataSource): Promise<void> {
  const positionRepo = dataSource.getRepository(Position);
  if ((await positionRepo.count()) === 0) {
    const defaults = ["성도", "서리집사", "안수집사", "권사", "장로", "전도사", "목사"];
    await positionRepo.save(
      defaults.map((name, index) =>
        positionRepo.create({ name, displayOrder: index + 1, isBuiltIn: 1 })
      )
    );
  }

  const sessionRepo = dataSource.getRepository(AttendanceSession);
  if ((await sessionRepo.count()) === 0) {
    const sessions = ["주일예배", "수요예배", "금요기도회"];
    await sessionRepo.save(
      sessions.map((name, index) =>
        sessionRepo.create({ name, displayOrder: index + 1, isBuiltIn: 1 })
      )
    );
  }

  const stageRepo = dataSource.getRepository(NewcomerStage);
  if ((await stageRepo.count()) === 0) {
    const stages = [
      { name: "등록", isFinal: 0 },
      { name: "새가족반", isFinal: 0 },
      { name: "수료", isFinal: 0 },
      { name: "정착", isFinal: 1 },
    ];
    await stageRepo.save(
      stages.map((s, index) =>
        stageRepo.create({ ...s, displayOrder: index + 1, isBuiltIn: 1 })
      )
    );
  }

  // 교적번호 없는 기존 교인에게 순번 부여 (code 컬럼 추가 후 1회 백필, 멱등적)
  const memberRepo = dataSource.getRepository(Member);
  const missing = await memberRepo.find({
    where: { code: IsNull() },
    order: { id: "ASC" },
    select: ["id"],
  });
  if (missing.length > 0) {
    const row = await memberRepo
      .createQueryBuilder("m")
      .select("MAX(CAST(m.code AS UNSIGNED))", "max")
      .where("m.code REGEXP '^[0-9]+$'")
      .getRawOne<{ max: string | null }>();
    let next = (parseInt(row?.max ?? "0", 10) || 0) + 1;
    for (const m of missing) {
      await memberRepo.update(m.id, { code: String(next).padStart(4, "0") });
      next++;
    }
  }
}
