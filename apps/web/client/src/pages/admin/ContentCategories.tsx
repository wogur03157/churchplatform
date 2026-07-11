import { api } from "@/lib/api";
import { CategoryDialog } from "@/features/content-pages/admin/CategoryDialog";
import { CategoryTreeList } from "@/features/content-pages/admin/CategoryTreeList";
import { useContentPageForest } from "@/features/content-pages/admin/hooks";
import {
  createEmptyCategoryForm,
  type CategoryFormState,
  type CategoryNode,
} from "@/features/content-pages/admin/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

function collectDescendantIds(node: CategoryNode): number[] {
  return node.children.flatMap((child) => [child.id, ...collectDescendantIds(child)]);
}

export default function AdminContentCategories() {
  const qc = useQueryClient();
  const { roots, flatCategories, isLoading } = useContentPageForest();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryNode | null>(null);
  const [form, setForm] = useState<CategoryFormState>(createEmptyCategoryForm());

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["content-pages"] });
  };

  const createCategory = useMutation({
    mutationFn: () =>
      api.post("/content-pages/categories", {
        parentId: form.parentId,
        name: form.name,
        slug: form.slug,
        sortOrder: form.sortOrder,
        status: form.status,
        templateCode: form.templateCode,
      }),
    onSuccess: () => {
      toast.success("카테고리를 추가했습니다.");
      refresh();
      closeDialog();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateCategory = useMutation({
    mutationFn: () =>
      api.patch(`/content-pages/categories/${editingCategory?.id}`, {
        parentId: form.parentId,
        name: form.name,
        slug: form.slug,
        sortOrder: form.sortOrder,
        status: form.status,
      }),
    onSuccess: () => {
      toast.success("카테고리를 수정했습니다.");
      refresh();
      closeDialog();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const removeCategory = useMutation({
    mutationFn: (id: number) => api.delete(`/content-pages/categories/${id}`),
    onSuccess: () => {
      toast.success("카테고리를 삭제했습니다.");
      refresh();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const parentOptions = useMemo(() => {
    const blocked = new Set<number>(
      editingCategory ? [editingCategory.id, ...collectDescendantIds(editingCategory)] : [],
    );

    return flatCategories
      .filter((item) => item.depth < 3 && !blocked.has(item.id))
      .map((item) => ({
        id: item.id,
        label: `${"ㆍ".repeat(Math.max(0, item.depth - 1))} ${item.name}`.trim(),
        depth: item.depth,
      }));
  }, [editingCategory, flatCategories]);

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setForm(createEmptyCategoryForm());
  };

  const openCreate = (parent: CategoryNode | null) => {
    setEditingCategory(null);
    setForm({
      ...createEmptyCategoryForm(),
      parentId: parent?.id ?? null,
    });
    setDialogOpen(true);
  };

  const openEdit = (category: CategoryNode) => {
    setEditingCategory(category);
    setForm({
      parentId: category.parentId,
      name: category.name,
      slug: category.slug,
      sortOrder: category.sortOrder,
      status: category.status,
      templateCode: category.page?.templateCode ?? "content",
    });
    setDialogOpen(true);
  };

  const submit = () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("이름과 slug를 입력해 주세요.");
      return;
    }

    if (editingCategory) {
      updateCategory.mutate();
      return;
    }

    createCategory.mutate();
  };

  return (
    <>
      <CategoryTreeList
        title="페이지 카테고리"
        description="공개 메뉴와 연결되는 전체 카테고리 구조를 DB에서 관리합니다. 3뎁스는 속성용으로 둘 수 있습니다."
        categories={roots}
        emptyText={isLoading ? "불러오는 중..." : "아직 등록된 카테고리가 없습니다."}
        showCreate
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={(category) => {
          if (confirm("이 카테고리를 삭제하시겠습니까?")) {
            removeCategory.mutate(category.id);
          }
        }}
      />

      <CategoryDialog
        open={dialogOpen}
        isEditing={Boolean(editingCategory)}
        form={form}
        pending={createCategory.isPending || updateCategory.isPending}
        parentOptions={parentOptions}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
            return;
          }
          setDialogOpen(true);
        }}
        onChange={(updater) => setForm((prev) => updater(prev))}
        onSubmit={submit}
      />
    </>
  );
}
