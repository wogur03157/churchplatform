import { useEffect, useState } from "react";

/**
 * 주소 해시(#slug)로 하위 항목을 고릅니다. 알 수 없는 slug는 첫 항목으로 둡니다.
 * 반환값은 항목의 번호(index)이며, 번호와 slug의 대응은 slugs 배열이 정합니다.
 */
export function useHashSlug(slugs: readonly string[]) {
  const parse = () => {
    const slug = decodeURIComponent(window.location.hash.replace("#", ""));
    const index = slugs.indexOf(slug);
    return index >= 0 ? index : 0;
  };
  const [index, setIndex] = useState(parse);

  useEffect(() => {
    const onHashChange = () => setIndex(parse());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugs]);

  return [index, setIndex] as const;
}
