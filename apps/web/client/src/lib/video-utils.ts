/**
 * 영상 임베드 URL 유틸리티 — 공개 페이지와 어드민에서 공통으로 사용합니다.
 * 컴포넌트마다 동일 로직을 복붙하지 말고 getVideoEmbedUrl()을 사용하세요.
 */

export interface VideoLike {
  videoType: string;
  url: string;
}

/**
 * YouTube / Vimeo 영상의 iframe src 를 반환합니다.
 * URL 파싱에 실패하거나 임베드 불가 타입이면 null을 반환합니다.
 */
export function getVideoEmbedUrl(video: VideoLike): string | null {
  if (video.videoType === "youtube") {
    const id = video.url.includes("youtu.be")
      ? (video.url.split("/").pop() ?? null)
      : (() => {
          try {
            return new URL(video.url).searchParams.get("v");
          } catch {
            return null;
          }
        })();
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (video.videoType === "vimeo") {
    const id = video.url.split("/").pop();
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  return null;
}
