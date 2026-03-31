/**
 * 怨듭쑀 ?뷀떚???명꽣?섏씠????DB ?ㅽ궎留?諛?mock ?곗씠??援ъ“瑜?諛섏쁺?⑸땲??
 * ?대씪?댁뼵?맞룹꽌踰??묒そ?먯꽌 "@shared/entities"濡?import?댁꽌 ?ъ슜?섏꽭??
 */

export interface Video {
  id: number;
  title: string;
  description: string | null;
  videoType: "youtube" | "vimeo" | "upload" | "url";
  fileKey: string | null;
  url: string;
  thumbnailUrl: string | null;
  mimeType: string | null;
  fileSize: number | null;
  duration: number | null;
  churchId: number | null;
  uploadedBy: number;
  status: "published" | "draft";
  displayOrder: number;
  categoryId: number | null;
  category: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface VideoCategory {
  id: number;
  name: string;
  slug: string;
  isBuiltIn: boolean;
  displayOrder: number;
  churchId: number | null;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  authorId: number;
  churchId: number | null;
  status: "published" | "draft";
  publishedAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Image {
  id: number;
  title: string;
  description: string | null;
  fileKey: string;
  url: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: number;
  churchId: number | null;
  status: "published" | "draft";
  displayOrder: number;
  showOnHome: boolean;
  categoryId: number | null;
  category: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Media {
  id: number;
  title: string;
  description: string | null;
  mediaType: "image" | "video";
  videoType: "youtube" | "vimeo" | "upload" | "url" | null;
  fileKey: string | null;
  url: string;
  thumbnailUrl: string | null;
  mimeType: string | null;
  fileSize: number | null;
  duration: number | null;
  churchId: number | null;
  uploadedBy: number;
  status: "published" | "draft";
  displayOrder: number;
  showOnHome: boolean;
  altText: string | null;
  categoryId: number | null;
  category: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Popup {
  id: number;
  churchId: number | null;
  title: string;
  imageKey: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  startDate: string | Date | null;
  endDate: string | Date | null;
  status: "active" | "inactive";
  createdBy: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface FloatingMessage {
  id: number;
  title: string;
  content: string;
  messageType: "announcement" | "warning" | "info" | "success";
  churchId: number | null;
  status: "active" | "inactive";
  startDate: string | Date | null;
  endDate: string | Date | null;
  displayPosition: "top" | "center" | "bottom";
  createdBy: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface LayoutSetting {
  id: number;
  sectionType: string;
  churchId: number | null;
  status: "visible" | "hidden";
  displayOrder: number;
  colSpan: number;
  title: string | null;
  subtitle: string | null;
  imageKey: string | null;
  imageUrl: string | null;
  updatedBy: number;
  updatedAt: string | Date;
}

export interface PageGroup {
  id: number;
  groupKey: string;
  name: string;
  slug: string;
  description: string | null;
  content: string | null;
  imageUrl: string | null;
  displayOrder: number;
  status: "visible" | "hidden";
  churchId: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type ContentPageStatus = "published" | "draft";
export type ContentTemplateCode = "hero" | "gallery" | "board" | "content";
export type ContentMediaType = "image" | "video";

export interface ContentCategory {
  id: number;
  churchId: number | null;
  parentId: number | null;
  name: string;
  slug: string;
  depth: 1 | 2 | 3;
  sortOrder: number;
  status: "active" | "hidden";
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ContentPageMedia {
  id: number;
  pageId: number;
  slotKey: string;
  mediaType: ContentMediaType;
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
  sortOrder: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ContentPage {
  id: number;
  categoryId: number;
  churchId: number | null;
  templateCode: ContentTemplateCode;
  title: string;
  content: string | null;
  status: ContentPageStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
  media?: ContentPageMedia[];
  category?: ContentCategory;
}

export type ChurchStatus = "pending" | "active" | "suspended" | "rejected";

export interface Church {
  id: number;
  name: string;
  slug: string;
  status: ChurchStatus;
  description: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  logoUrl: string | null;
  customDomain: string | null;
  appliedBy: number;
  approvedBy: number | null;
  approvedAt: string | Date | null;
  rejectedReason: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ChurchFeature {
  id: number;
  churchId: number;
  featureKey: string;
  status: "enabled" | "disabled";
  updatedBy: number | null;
  updatedAt: string | Date;
}

export type FormFieldType = "text" | "number" | "dropdown" | "textarea" | "checkbox" | "radio";

export interface FormField {
  id: number;
  churchId: number | null;
  fieldType: FormFieldType;
  label: string;
  placeholder: string | null;
  required: boolean;
  options: string[] | null;
  allowOther: "text" | "none";
  displayOrder: number;
  status: "active" | "inactive";
}

export interface FormSubmission {
  id: number;
  fieldData: Record<string, string>;
  submittedAt: string | Date;
  churchId: number | null;
}

export interface SiteConfig {
  id: number;
  churchId: number | null;
  key: string;
  value: string;
  description: string | null;
}


