/**
 * 동명이인 구별용 맥락 정보 유틸.
 * 교적번호(고유 식별자)를 1층으로, 생년월일·전화 뒷자리를 2층으로 사용한다.
 */

export type MemberLike = {
  name: string;
  code?: string | null;
  birthDate?: string | null;
  phone?: string | null;
};

/** 생년월일 → "90.03.15" (연.월.일). 없으면 빈 문자열 */
export function formatBirth(birthDate?: string | null): string {
  if (!birthDate) return "";
  const s = String(birthDate).slice(0, 10);
  const [y, m, d] = s.split("-");
  if (!y || !m || !d) return s;
  return `${y.slice(2)}.${m}.${d}`;
}

/** 전화 뒷 4자리 → "…5678". 없으면 빈 문자열 */
export function phoneTail(phone?: string | null): string {
  if (!phone) return "";
  const digits = phone.replace(/[^0-9]/g, "");
  return digits.length >= 4 ? `…${digits.slice(-4)}` : "";
}

/**
 * 이름 옆에 붙일 맥락 문자열. 예: "90.03.15 · …5678 · #0042"
 * 재정 등 전화번호가 부담스러운 곳은 includePhone=false로 끌 수 있다.
 */
export function memberMeta(m: MemberLike, opts?: { includePhone?: boolean }): string {
  const parts: string[] = [];
  const birth = formatBirth(m.birthDate);
  if (birth) parts.push(birth);
  if (opts?.includePhone !== false) {
    const tail = phoneTail(m.phone);
    if (tail) parts.push(tail);
  }
  if (m.code) parts.push(`#${m.code}`);
  return parts.join(" · ");
}

/** 목록에서 이름이 겹치는 사람들의 집합 (중복이면 맥락을 강조 표시) */
export function duplicateNames(members: { name: string }[]): Set<string> {
  const seen = new Map<string, number>();
  for (const m of members) seen.set(m.name, (seen.get(m.name) ?? 0) + 1);
  const dups = new Set<string>();
  seen.forEach((n, name) => {
    if (n > 1) dups.add(name);
  });
  return dups;
}
