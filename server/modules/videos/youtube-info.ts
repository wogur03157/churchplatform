/**
 * 유튜브 영상 설명(설교 정보)을 파싱합니다.
 *
 * 설명 형식 예시:
 *   2026년 10월 11일 영신교회 주일예배
 *
 *   | 제목 : 사도신경(6) 나는 승천하시어 ... (에베소서 1장 20-22절)
 *   | 말씀 : 김상호 담임목사
 */

export function extractYoutubeVideoId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.split("/").filter(Boolean)[0] ?? null;
    }
    const v = u.searchParams.get("v");
    if (v) return v;
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.findIndex((p) => p === "embed" || p === "shorts" || p === "live");
    return idx >= 0 ? (parts[idx + 1] ?? null) : null;
  } catch {
    return null;
  }
}

export type SermonInfo = {
  title: string | null;
  sermonDate: string | null;
  scripture: string | null;
  preacher: string | null;
};

/** 설명에서 설교 날짜, 제목, 본문을 찾습니다. 찾지 못한 값은 null입니다. */
export function parseSermonDescription(description: string, publishedAt?: string): SermonInfo {
  let sermonDate: string | null = null;
  const dateMatch = description.match(/(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/);
  if (dateMatch) {
    const [, y, m, d] = dateMatch;
    sermonDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  } else if (publishedAt) {
    sermonDate = publishedAt.slice(0, 10);
  }

  let title: string | null = null;
  let scripture: string | null = null;
  const titleMatch = description.match(/^\s*\|?\s*제목\s*[:：]\s*(.+)$/m);
  if (titleMatch) {
    let raw = titleMatch[1].trim();
    // 끝의 "(에베소서 1장 20-22절)", "(몬1-3)" 같은 본문 괄호
    const scriptureMatch = raw.match(/\(([^()]*\d[^()]*)\)\s*$/);
    if (scriptureMatch) {
      scripture = scriptureMatch[1].trim();
      raw = raw.slice(0, scriptureMatch.index).trim();
    }
    title = raw || null;
  }

  const preacherMatch = description.match(/^\s*\|?\s*말씀\s*[:：]\s*(.+)$/m);
  const preacher = preacherMatch ? preacherMatch[1].trim() || null : null;

  return { title, sermonDate, scripture, preacher };
}

export async function fetchYoutubeSnippet(videoId: string) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    throw new Error("YOUTUBE_API_KEY가 설정되지 않았습니다.");
  }
  const endpoint = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${encodeURIComponent(videoId)}&key=${encodeURIComponent(key)}`;
  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error(`유튜브 API 오류 (${res.status})`);
  }
  const json = (await res.json()) as {
    items?: { snippet: { title: string; description: string; publishedAt: string; thumbnails?: Record<string, { url: string }> } }[];
  };
  const item = json.items?.[0];
  if (!item) {
    throw new Error("영상을 찾을 수 없습니다.");
  }
  const thumb = item.snippet.thumbnails?.maxres ?? item.snippet.thumbnails?.high ?? item.snippet.thumbnails?.default;
  return {
    youtubeTitle: item.snippet.title,
    description: item.snippet.description,
    publishedAt: item.snippet.publishedAt,
    thumbnailUrl: thumb?.url ?? null,
  };
}
