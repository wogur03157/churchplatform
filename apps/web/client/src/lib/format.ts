/** 화면 전반에서 쓰는 포맷·날짜 헬퍼 (각 페이지에 복붙되던 것을 통합) */

/** 원화 표기 — 1,000,000원. 문자열 금액(DECIMAL 응답)도 허용 */
export const won = (n: number | string): string =>
  Number(n).toLocaleString("ko-KR") + "원";

/**
 * raw HTML 삽입(인쇄 창 등) 전 이스케이프.
 * 교인 이름·단체명에 섞인 태그가 실행되는 것을 막는다.
 */
export function escapeHtml(value: string | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 오늘 (YYYY-MM-DD, 로컬) */
export const today = (): string => new Date().toISOString().slice(0, 10);

/** 이번 달 1일 ~ 오늘 범위 (기간 필터 기본값) */
export function monthRange(): { from: string; to: string } {
  const now = new Date();
  const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  return { from, to: now.toISOString().slice(0, 10) };
}

/** 헌금 입금 수단 라벨 (헌금 계수·장부 공용) */
export const OFFERING_METHOD_LABELS = { cash: "현금", check: "수표", transfer: "이체" } as const;
