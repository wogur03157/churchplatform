import { api } from "@/lib/api";
import { CategoryTreeList } from "@/features/content-pages/admin/CategoryTreeList";
import { useContentPageDetail, useContentPageForest } from "@/features/content-pages/admin/hooks";
import { PageEditor } from "@/features/content-pages/admin/PageEditor";
import {
  createEmptyPageForm,
  type PageFormState,
} from "@/features/content-pages/admin/types";
import { buildCategoryHref, findCategoryByPageId, findCategoryPath } from "@/features/content-pages/admin/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function AdminContentPages() {
  const qc = useQueryClient();
  const { roots, flatCategories, isLoading } = useContentPageForest();
  const [selectedPageId, setSelectedPageId] = useState<number | null>(null);
  const [pageForm, setPageForm] = useState<PageFormState>(createEmptyPageForm());

  useEffect(() => {
    if (!selectedPageId) {
      const firstPage = flatCategories.find((item) => item.page?.id)?.page?.id ?? null;
      if (firstPage) {
        setSelectedPageId(firstPage);
      }
    }
  }, [flatCategories, selectedPageId]);

  const selectedCategory = findCategoryByPageId(roots, selectedPageId);
  const selectedPath = useMemo(() => {
    if (!selectedCategory) {
      return null;
    }

    const fullPath = findCategoryPath(roots, selectedCategory.id);
    if (!fullPath) {
      return null;
    }

    const ancestors = fullPath.slice(0, -1);
    return buildCategoryHref(selectedCategory, ancestors);
  }, [roots, selectedCategory]);

  const { data: pageDetail, isFetching: isPageLoading } = useContentPageDetail(selectedPageId);

  useEffect(() => {
    if (!pageDetail) {
      return;
    }

    setPageForm({
      title: pageDetail.title,
      content: pageDetail.content ?? "",
      templateCode: pageDetail.templateCode,
      status: pageDetail.status,
      media: (pageDetail.media ?? []).map((item) => ({
        slotKey: item.slotKey,
        mediaType: item.mediaType,
        url: item.url,
        thumbnailUrl: item.thumbnailUrl ?? "",
        altText: item.altText ?? "",
        sortOrder: item.sortOrder,
      })),
    });
  }, [pageDetail]);

  const savePage = useMutation({
    mutationFn: () =>
      api.patch(`/content-pages/${selectedPageId}`, {
        title: pageForm.title,
        content: pageForm.content,
        templateCode: pageForm.templateCode,
        status: pageForm.status,
        media: pageForm.media.filter((item) => item.url.trim().length > 0),
      }),
    onSuccess: () => {
      toast.success("페이지를 저장했습니다.");
      qc.invalidateQueries({ queryKey: ["content-pages"] });
      if (selectedPageId) {
        qc.invalidateQueries({ queryKey: ["content-pages", "page", selectedPageId] });
      }
    },
    onError: (error: any) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <CategoryTreeList
        title="페이지 내용"
        description="DB 카테고리에 연결된 페이지를 뎁스별로 선택하고 편집합니다."
        categories={roots}
        selectedPageId={selectedPageId}
        emptyText={isLoading ? "불러오는 중..." : "아직 편집할 페이지가 없습니다."}
        onSelectPage={setSelectedPageId}
      />

      <PageEditor
        selectedCategory={selectedCategory}
        previewPath={selectedPath}
        pageForm={pageForm}
        isLoading={isPageLoading}
        isSaving={savePage.isPending}
        onChange={(updater) => setPageForm((prev) => updater(prev))}
        onSave={() => savePage.mutate()}
      />
    </div>
  );
}
