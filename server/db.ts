import { eq, desc, and, lte, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  announcements,
  InsertAnnouncement,
  images,
  InsertImage,
  videos,
  InsertVideo,
  floatingMessages,
  InsertFloatingMessage,
  layoutSettings,
  InsertLayoutSetting
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Announcements
export async function createAnnouncement(data: InsertAnnouncement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(announcements).values(data);
  return result;
}

export async function getAnnouncements(publishedOnly = false) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const query = publishedOnly 
    ? db.select().from(announcements).where(eq(announcements.isPublished, 1)).orderBy(desc(announcements.createdAt))
    : db.select().from(announcements).orderBy(desc(announcements.createdAt));
  
  return await query;
}

export async function getAnnouncementById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateAnnouncement(id: number, data: Partial<InsertAnnouncement>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(announcements).set(data).where(eq(announcements.id, id));
}

export async function deleteAnnouncement(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(announcements).where(eq(announcements.id, id));
}

// Images
export async function createImage(data: InsertImage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(images).values(data);
  return result;
}

export async function getImages(publishedOnly = false) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const query = publishedOnly 
    ? db.select().from(images).where(eq(images.isPublished, 1)).orderBy(images.displayOrder, desc(images.createdAt))
    : db.select().from(images).orderBy(images.displayOrder, desc(images.createdAt));
  
  return await query;
}

export async function getImageById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(images).where(eq(images.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateImage(id: number, data: Partial<InsertImage>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(images).set(data).where(eq(images.id, id));
}

export async function deleteImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(images).where(eq(images.id, id));
}

// Videos
export async function createVideo(data: InsertVideo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(videos).values(data);
  return result;
}

export async function getVideos(publishedOnly = false) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const query = publishedOnly 
    ? db.select().from(videos).where(eq(videos.isPublished, 1)).orderBy(videos.displayOrder, desc(videos.createdAt))
    : db.select().from(videos).orderBy(videos.displayOrder, desc(videos.createdAt));
  
  return await query;
}

export async function getVideoById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateVideo(id: number, data: Partial<InsertVideo>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(videos).set(data).where(eq(videos.id, id));
}

export async function deleteVideo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(videos).where(eq(videos.id, id));
}

// Floating Messages
export async function createFloatingMessage(data: InsertFloatingMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(floatingMessages).values(data);
  return result;
}

export async function getFloatingMessages(activeOnly = false) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (activeOnly) {
    const now = new Date();
    const result = await db.select().from(floatingMessages)
      .where(
        and(
          eq(floatingMessages.isActive, 1),
          lte(floatingMessages.startDate, now),
          gte(floatingMessages.endDate, now)
        )
      )
      .orderBy(desc(floatingMessages.createdAt));
    return result;
  }
  
  return await db.select().from(floatingMessages).orderBy(desc(floatingMessages.createdAt));
}

export async function getFloatingMessageById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(floatingMessages).where(eq(floatingMessages.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateFloatingMessage(id: number, data: Partial<InsertFloatingMessage>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(floatingMessages).set(data).where(eq(floatingMessages.id, id));
}

export async function deleteFloatingMessage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(floatingMessages).where(eq(floatingMessages.id, id));
}

// Layout Settings
export async function getLayoutSettings() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(layoutSettings).orderBy(layoutSettings.displayOrder);
}

export async function upsertLayoutSetting(data: InsertLayoutSetting) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(layoutSettings).values(data).onDuplicateKeyUpdate({
    set: {
      isVisible: data.isVisible,
      displayOrder: data.displayOrder,
      title: data.title,
      subtitle: data.subtitle,
      updatedBy: data.updatedBy,
    }
  });
}

export async function updateLayoutSetting(id: number, data: Partial<InsertLayoutSetting>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(layoutSettings).set(data).where(eq(layoutSettings.id, id));
}
