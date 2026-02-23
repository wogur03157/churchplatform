import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 공지사항 테이블
 */
export const announcements = mysqlTable("announcements", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  authorId: int("authorId").notNull().references(() => users.id),
  isPublished: int("isPublished").default(0).notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

/**
 * 이미지 갤러리 테이블
 */
export const images = mysqlTable("images", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  url: varchar("url", { length: 1024 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"),
  uploadedBy: int("uploadedBy").notNull().references(() => users.id),
  isPublished: int("isPublished").default(0).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Image = typeof images.$inferSelect;
export type InsertImage = typeof images.$inferInsert;

/**
 * 영상 테이블
 */
export const videos = mysqlTable("videos", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  videoType: mysqlEnum("videoType", ["upload", "youtube", "vimeo", "url"]).notNull(),
  fileKey: varchar("fileKey", { length: 512 }),
  url: varchar("url", { length: 1024 }).notNull(),
  thumbnailUrl: varchar("thumbnailUrl", { length: 1024 }),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"),
  duration: int("duration"),
  uploadedBy: int("uploadedBy").notNull().references(() => users.id),
  isPublished: int("isPublished").default(0).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Video = typeof videos.$inferSelect;
export type InsertVideo = typeof videos.$inferInsert;

/**
 * 플로팅 창 정보 테이블
 */
export const floatingMessages = mysqlTable("floatingMessages", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  messageType: mysqlEnum("messageType", ["info", "warning", "success", "announcement"]).default("info").notNull(),
  isActive: int("isActive").default(0).notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  displayPosition: mysqlEnum("displayPosition", ["top", "bottom", "center"]).default("center").notNull(),
  createdBy: int("createdBy").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FloatingMessage = typeof floatingMessages.$inferSelect;
export type InsertFloatingMessage = typeof floatingMessages.$inferInsert;

/**
 * 레이아웃 설정 테이블
 */
export const layoutSettings = mysqlTable("layoutSettings", {
  id: int("id").autoincrement().primaryKey(),
  sectionType: mysqlEnum("sectionType", ["announcements", "images", "videos", "hero"]).notNull().unique(),
  isVisible: int("isVisible").default(1).notNull(),
  displayOrder: int("displayOrder").notNull(),
  title: varchar("title", { length: 255 }),
  subtitle: text("subtitle"),
  updatedBy: int("updatedBy").references(() => users.id),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LayoutSetting = typeof layoutSettings.$inferSelect;
export type InsertLayoutSetting = typeof layoutSettings.$inferInsert;

/**
 * 플로팅 메시지 폼 필드 설정 테이블
 */
export const formFields = mysqlTable("formFields", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("messageId").notNull().references(() => floatingMessages.id, { onDelete: "cascade" }),
  fieldName: varchar("fieldName", { length: 255 }).notNull(),
  fieldType: mysqlEnum("fieldType", ["text", "email", "phone", "select", "textarea"]).notNull(),
  fieldLabel: varchar("fieldLabel", { length: 255 }).notNull(),
  isRequired: int("isRequired").default(1).notNull(),
  displayOrder: int("displayOrder").notNull(),
  selectOptions: text("selectOptions"), // JSON 형식: ["option1", "option2"]
  placeholder: varchar("placeholder", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FormField = typeof formFields.$inferSelect;
export type InsertFormField = typeof formFields.$inferInsert;

/**
 * 플로팅 메시지 폼 제출 데이터 테이블
 */
export const submissions = mysqlTable("submissions", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("messageId").notNull().references(() => floatingMessages.id, { onDelete: "cascade" }),
  submissionData: text("submissionData").notNull(), // JSON 형식
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
});

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = typeof submissions.$inferInsert;