import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { CategoryNode, PageDetail } from "./types";
import { flattenCategoryTree } from "./utils";

export function useContentPageForest() {
  const query = useQuery<CategoryNode[]>({
    queryKey: ["content-pages", "tree", "forest"],
    queryFn: () => api.get<CategoryNode[]>("/content-pages/categories/tree"),
  });

  const roots = query.data ?? [];
  const flatCategories = useMemo(() => flattenCategoryTree(roots), [roots]);

  return {
    ...query,
    roots,
    flatCategories,
  };
}

export function useContentPageDetail(pageId: number | null) {
  return useQuery<PageDetail | null>({
    queryKey: ["content-pages", "page", pageId],
    queryFn: () => api.get<PageDetail>(`/content-pages/${pageId}`),
    enabled: pageId !== null,
  });
}
