import type { ContentTemplateCode } from "@shared/entities";

export const TEMPLATE_LABELS: Record<ContentTemplateCode, string> = {
  hero: "Hero",
  gallery: "Gallery",
  board: "Board",
  content: "Content",
};

export const SLOT_CONFIG: Record<ContentTemplateCode, string[]> = {
  hero: ["hero", "body_img", "side_img"],
  gallery: ["gallery"],
  board: ["item_thumb"],
  content: ["inline", "side_img"],
};
