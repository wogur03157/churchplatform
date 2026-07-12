import { BadRequestException } from "@nestjs/common";

/** YYYY-MM-DD 형식 검증 — 아니면 400 (DB 에러 500 노출 방지) */
export function assertDateString(value: string | undefined | null, label = "날짜"): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
    throw new BadRequestException(`${label} 형식이 올바르지 않습니다 (YYYY-MM-DD)`);
  }
  return value;
}

/** 정수 쿼리 파라미터 검증 */
export function parseIntParam(value: string | undefined, label: string, min = 1, max = 9999): number {
  const parsed = parseInt(value ?? "");
  if (Number.isNaN(parsed) || parsed < min || parsed > max) {
    throw new BadRequestException(`${label}이(가) 올바르지 않습니다`);
  }
  return parsed;
}
