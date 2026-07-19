import type { Repository } from "typeorm";
import { Member } from "./member.entity";

/** 교적번호 표기 — 4자리 0채움 (0001, 0042 …) */
export function formatMemberCode(n: number): string {
  return String(n).padStart(4, "0");
}

/**
 * 다음 교적번호 — 숫자형 코드 중 최댓값+1을 4자리로.
 * 서비스(요청 시 발번)와 시드(백필)가 같은 규칙을 쓰도록 공통화.
 */
export async function nextMemberCode(repo: Repository<Member>): Promise<string> {
  const row = await repo
    .createQueryBuilder("m")
    .select("MAX(CAST(m.code AS UNSIGNED))", "max")
    .where("m.code REGEXP '^[0-9]+$'")
    .getRawOne<{ max: string | null }>();
  return formatMemberCode((parseInt(row?.max ?? "0", 10) || 0) + 1);
}
