/**
 * 공유 엔티티 인터페이스 — DB 스키마 및 mock 데이터 구조를 반영합니다.
 * 클라이언트·서버 양쪽에서 "@shared/entities"로 import해서 사용하세요.
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
