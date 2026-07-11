import type {
  ContentCategory,
  ContentPage,
  ContentPageMedia,
  ContentTemplateCode,
} from "@shared/entities";

export type CategoryNode = ContentCategory & {
  page: Pick<ContentPage, "id" | "templateCode" | "status" | "title"> | null;
  children: CategoryNode[];
};

export type PageDetail = ContentPage & { media: ContentPageMedia[] };

export type MediaDraft = {
  slotKey: string;
  mediaType: "image" | "video";
  url: string;
  thumbnailUrl: string;
  altText: string;
  sortOrder: number;
};

export type CategoryFormState = {
  parentId: number | null;
  name: string;
  slug: string;
  sortOrder: number;
  status: "active" | "hidden";
  templateCode: ContentTemplateCode;
};

export type PageFormState = {
  title: string;
  content: string;
  templateCode: ContentTemplateCode;
  status: "published" | "draft";
  media: MediaDraft[];
};

export function createEmptyCategoryForm(): CategoryFormState {
  return {
    parentId: null,
    name: "",
    slug: "",
    sortOrder: 0,
    status: "active",
    templateCode: "content",
  };
}

export function createEmptyPageForm(): PageFormState {
  return {
    title: "",
    content: "",
    templateCode: "content",
    status: "draft",
    media: [],
  };
}
