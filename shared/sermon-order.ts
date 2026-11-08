type SermonOrderItem = {
  id?: number;
  displayOrder?: number | null;
  sermonDate?: string | Date | null;
  createdAt?: string | Date | null;
};

function dateKey(value: string | Date | null | undefined): string {
  if (value == null || value === "") return "";
  if (typeof value === "string") {
    const match = value.trim().match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : value.trim();
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(value);
}

function timeKey(value: string | Date | null | undefined): string {
  if (value == null || value === "") return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
  return String(value);
}

/** 표시 순서가 0이 아니면 그 숫자순으로 앞에 두고, 나머지는 설교일 최신순. */
export function compareSermonVideos(a: SermonOrderItem, b: SermonOrderItem): number {
  const aOrder = Number(a.displayOrder ?? 0);
  const bOrder = Number(b.displayOrder ?? 0);
  const aManual = Number.isFinite(aOrder) && aOrder !== 0;
  const bManual = Number.isFinite(bOrder) && bOrder !== 0;

  if (aManual !== bManual) return aManual ? -1 : 1;
  if (aManual && aOrder !== bOrder) return aOrder - bOrder;

  const da = dateKey(a.sermonDate) || dateKey(a.createdAt);
  const db = dateKey(b.sermonDate) || dateKey(b.createdAt);
  if (da !== db) return da < db ? 1 : -1;

  const ca = timeKey(a.createdAt);
  const cb = timeKey(b.createdAt);
  if (ca !== cb) return ca < cb ? 1 : -1;
  return (b.id ?? 0) - (a.id ?? 0);
}
