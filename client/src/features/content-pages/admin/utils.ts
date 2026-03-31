import type { CategoryNode } from "./types";

export function flattenCategoryTree(nodes: CategoryNode[]): CategoryNode[] {
  return nodes.flatMap((node) => [node, ...flattenCategoryTree(node.children)]);
}

export function findCategoryByPageId(
  nodes: CategoryNode[],
  pageId: number | null,
): CategoryNode | null {
  if (pageId === null) {
    return null;
  }

  for (const node of nodes) {
    if (node.page?.id === pageId) {
      return node;
    }

    const found = findCategoryByPageId(node.children, pageId);
    if (found) {
      return found;
    }
  }

  return null;
}

export function findCategoryPath(
  nodes: CategoryNode[],
  categoryId: number,
  ancestors: CategoryNode[] = [],
): CategoryNode[] | null {
  for (const node of nodes) {
    const nextAncestors = [...ancestors, node];
    if (node.id === categoryId) {
      return nextAncestors;
    }

    const found = findCategoryPath(node.children, categoryId, nextAncestors);
    if (found) {
      return found;
    }
  }

  return null;
}

export function buildCategoryHref(category: CategoryNode, ancestors: CategoryNode[] = []): string {
  const path = [...ancestors.map((item) => item.slug), category.slug].join("/");
  return `/${path}`;
}
