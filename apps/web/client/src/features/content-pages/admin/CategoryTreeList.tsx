import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TEMPLATE_LABELS } from "./constants";
import type { CategoryNode } from "./types";
import { buildCategoryHref, findCategoryPath } from "./utils";

type CategoryTreeListProps = {
  title: string;
  description: string;
  categories: CategoryNode[];
  selectedPageId?: number | null;
  emptyText: string;
  showCreate?: boolean;
  onCreate?: (parent: CategoryNode | null) => void;
  onEdit?: (category: CategoryNode) => void;
  onDelete?: (category: CategoryNode) => void;
  onSelectPage?: (pageId: number | null) => void;
};

export function CategoryTreeList({
  title,
  description,
  categories,
  selectedPageId,
  emptyText,
  showCreate = false,
  onCreate,
  onEdit,
  onDelete,
  onSelectPage,
}: CategoryTreeListProps) {
  const [selectedDepth1Id, setSelectedDepth1Id] = useState<number | null>(null);
  const [selectedDepth2Id, setSelectedDepth2Id] = useState<number | null>(null);
  const [selectedDepth3Id, setSelectedDepth3Id] = useState<number | null>(null);

  const selectedDepth1 = categories.find((item) => item.id === selectedDepth1Id) ?? null;
  const depth2Items = selectedDepth1?.children ?? [];
  const selectedDepth2 = depth2Items.find((item) => item.id === selectedDepth2Id) ?? null;
  const depth3Items = selectedDepth2?.children ?? [];

  const selectedCategoryId = useMemo(() => {
    return selectedDepth3Id ?? selectedDepth2Id ?? selectedDepth1Id ?? null;
  }, [selectedDepth1Id, selectedDepth2Id, selectedDepth3Id]);

  useEffect(() => {
    if (!selectedPageId) {
      return;
    }

    const path = findCategoryPathByPageId(categories, selectedPageId);
    if (!path) {
      return;
    }

    setSelectedDepth1Id(path[0]?.id ?? null);
    setSelectedDepth2Id(path[1]?.id ?? null);
    setSelectedDepth3Id(path[2]?.id ?? null);
  }, [categories, selectedPageId]);

  const renderColumn = (
    label: string,
    helper: string,
    nodes: CategoryNode[],
    depth: 1 | 2 | 3,
    emptyMessage: string,
  ) => (
    <div className="min-w-[320px] flex-1 rounded-xl border bg-muted/20">
      <div className="border-b px-4 py-3">
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
      </div>
      <div className="space-y-2 p-3">
        {nodes.length === 0 ? (
          <p className="px-2 py-8 text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          nodes.map((category) => renderItem(category, depth))
        )}
      </div>
    </div>
  );

  const handleSelect = (category: CategoryNode, depth: 1 | 2 | 3) => {
    if (depth === 1) {
      setSelectedDepth1Id(category.id);
      setSelectedDepth2Id(null);
      setSelectedDepth3Id(null);
    }

    if (depth === 2) {
      setSelectedDepth2Id(category.id);
      setSelectedDepth3Id(null);
    }

    if (depth === 3) {
      setSelectedDepth3Id(category.id);
    }

    if (onSelectPage && category.page?.id) {
      onSelectPage(category.page.id);
    }
  };

  const renderItem = (category: CategoryNode, depth: 1 | 2 | 3) => {
    const path = findCategoryPath(categories, category.id) ?? [category];
    const ancestors = path.slice(0, -1);
    const isSelected = selectedCategoryId === category.id;

    return (
      <div
        key={category.id}
        className={`rounded-lg border p-3 transition-colors ${
          isSelected ? "border-primary bg-primary/5" : "bg-background hover:bg-background/80"
        }`}
      >
        <button className="w-full text-left" onClick={() => handleSelect(category, depth)}>
          <CategoryRow category={category} ancestors={ancestors} />
        </button>

        {(onCreate || onEdit || onDelete) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {onCreate && category.depth < 3 && (
              <Button variant="outline" size="sm" onClick={() => onCreate(category)}>
                <Plus className="mr-1 h-3.5 w-3.5" />하위 추가
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(category)}>
                <Edit className="mr-1 h-3.5 w-3.5" />설정
              </Button>
            )}
            {onDelete && (
              <Button variant="outline" size="sm" onClick={() => onDelete(category)}>
                <Trash2 className="mr-1 h-3.5 w-3.5" />삭제
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {showCreate && onCreate && (
          <Button size="sm" onClick={() => onCreate(null)}>
            <Plus className="mr-2 h-4 w-4" />상위 추가
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-[980px] gap-4">
              {renderColumn(
                "1뎁스",
                "전체 상위 메뉴",
                categories,
                1,
                "등록된 1뎁스 카테고리가 없습니다.",
              )}
              {renderColumn(
                "2뎁스",
                selectedDepth1 ? `${selectedDepth1.name}의 하위 메뉴` : "1뎁스를 선택하면 표시됩니다.",
                depth2Items,
                2,
                selectedDepth1 ? "선택한 1뎁스에 2뎁스가 없습니다." : "먼저 1뎁스를 선택해 주세요.",
              )}
              {renderColumn(
                "3뎁스",
                selectedDepth2 ? `${selectedDepth2.name}의 속성/하위 항목` : "2뎁스를 선택하면 표시됩니다.",
                depth3Items,
                3,
                selectedDepth2 ? "선택한 2뎁스에 3뎁스가 없습니다." : "먼저 2뎁스를 선택해 주세요.",
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CategoryRow({ category, ancestors }: { category: CategoryNode; ancestors: CategoryNode[] }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-medium">{category.name}</p>
        <p className="text-xs text-muted-foreground">{buildCategoryHref(category, ancestors)}</p>
        {category.page && (
          <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
            페이지 제목: {category.page.title}
          </p>
        )}
      </div>
      {category.page && (
        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline">{TEMPLATE_LABELS[category.page.templateCode]}</Badge>
          <Badge variant={category.page.status === "published" ? "default" : "secondary"}>
            {category.page.status === "published" ? "공개" : "임시저장"}
          </Badge>
        </div>
      )}
    </div>
  );
}

function findCategoryPathByPageId(nodes: CategoryNode[], pageId: number, ancestors: CategoryNode[] = []): CategoryNode[] | null {
  for (const node of nodes) {
    const nextAncestors = [...ancestors, node];
    if (node.page?.id === pageId) {
      return nextAncestors;
    }

    const found = findCategoryPathByPageId(node.children, pageId, nextAncestors);
    if (found) {
      return found;
    }
  }

  return null;
}

