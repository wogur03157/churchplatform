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

/**
 * 금액(원) 검증 — DECIMAL(15,0) 컬럼 범위 안의 양의 정수여야 함.
 * 최대 999,999,999,999,999원(약 1000조). 초과 시 500 대신 400.
 */
const MAX_AMOUNT = 999_999_999_999_999;
export function assertAmount(value: number | undefined | null, label = "금액"): number {
  if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value)) {
    throw new BadRequestException(`${label}은(는) 정수여야 합니다`);
  }
  if (value <= 0) {
    throw new BadRequestException(`${label}은(는) 1원 이상이어야 합니다`);
  }
  if (value > MAX_AMOUNT) {
    throw new BadRequestException(`${label}이(가) 너무 큽니다`);
  }
  return value;
}
