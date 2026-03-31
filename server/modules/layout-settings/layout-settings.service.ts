import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LayoutSetting } from "./entities/layout-setting.entity";

type LayoutSectionType =
  | "announcements"
  | "images"
  | "videos"
  | "hero"
  | "image_a"
  | "image_b";

const ALL_SECTION_TYPES: LayoutSectionType[] = [
  "hero",
  "announcements",
  "images",
  "videos",
  "image_a",
  "image_b",
];

const FALLBACK_SECTION_ORDER: LayoutSectionType[] = [
  "hero",
  "videos",
  "image_a",
  "announcements",
  "images",
  "image_b",
];

@Injectable()
export class LayoutSettingsService {
  constructor(
    @InjectRepository(LayoutSetting)
    private readonly repo: Repository<LayoutSetting>
  ) {}

  async findAll(churchId?: number): Promise<LayoutSetting[]> {
    const where = churchId ? { churchId } : {};
    const items = await this.repo.find({ where, order: { displayOrder: "ASC" } });

    if (!churchId) {
      return items;
    }

    return this.repairCorruptedSectionTypes(churchId, items);
  }

  private inferSectionType(
    item: LayoutSetting,
    remaining: LayoutSectionType[]
  ): LayoutSectionType | null {
    const text = `${item.title ?? ""} ${item.subtitle ?? ""}`.toLowerCase();
    const match = (type: LayoutSectionType, patterns: string[]) =>
      remaining.includes(type) && patterns.some((pattern) => text.includes(pattern));

    if (match("hero", ["환영", "welcome", "오신", "메인", "배너"])) return "hero";
    if (match("videos", ["설교", "영상", "예배", "youtube", "유튜브"])) return "videos";
    if (match("announcements", ["공지", "소식", "알림", "notice"])) return "announcements";
    if (match("images", ["갤러리", "사진", "포토", "gallery"])) return "images";

    if (!item.title?.trim()) {
      if (remaining.includes("image_a")) return "image_a";
      if (remaining.includes("image_b")) return "image_b";
    }

    if (item.status === "hidden" && remaining.includes("image_b")) {
      return "image_b";
    }

    return FALLBACK_SECTION_ORDER.find((type) => remaining.includes(type)) ?? null;
  }

  private async repairCorruptedSectionTypes(
    churchId: number,
    items: LayoutSetting[]
  ): Promise<LayoutSetting[]> {
    const counts = new Map<LayoutSectionType, number>();
    for (const item of items) {
      counts.set(item.sectionType, (counts.get(item.sectionType) ?? 0) + 1);
    }

    const hasDuplicates = Array.from(counts.values()).some((count) => count > 1);
    if (!hasDuplicates) {
      return items;
    }

    const sorted = [...items].sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id);
    const assigned = new Set<LayoutSectionType>();
    const duplicates: LayoutSetting[] = [];

    for (const item of sorted) {
      if ((counts.get(item.sectionType) ?? 0) === 1 && !assigned.has(item.sectionType)) {
        assigned.add(item.sectionType);
      } else {
        duplicates.push(item);
      }
    }

    const changed: LayoutSetting[] = [];
    for (const item of duplicates) {
      const remaining = ALL_SECTION_TYPES.filter((type) => !assigned.has(type));
      if (remaining.length === 0) {
        break;
      }

      const nextType = this.inferSectionType(item, remaining);
      if (!nextType) {
        continue;
      }

      assigned.add(nextType);
      if (item.sectionType !== nextType) {
        item.sectionType = nextType;
        changed.push(item);
      }
    }

    if (changed.length > 0) {
      await this.repo.save(changed);
      console.warn(
        `[LayoutSettingsService] repaired duplicated section types for church ${churchId}: ${changed
          .map((item) => `${item.id}:${item.sectionType}`)
          .join(", ")}`
      );
    }

    return sorted;
  }

  private async upsertOne(data: {
    sectionType: LayoutSectionType;
    status: "visible" | "hidden";
    displayOrder: number;
    colSpan?: number;
    gridCols?: number | null;
    title?: string;
    subtitle?: string;
    imageKey?: string;
    imageUrl?: string;
    churchId: number;
    updatedBy: number;
  }): Promise<void> {
    let entity = await this.repo.findOne({
      where: {
        churchId: data.churchId,
        sectionType: data.sectionType,
      },
    });

    if (entity) {
      Object.assign(entity, data);
    } else {
      entity = this.repo.create(data);
    }
    await this.repo.save(entity);
  }

  async upsert(data: {
    sectionType: LayoutSectionType;
    status: "visible" | "hidden";
    displayOrder: number;
    colSpan?: number;
    gridCols?: number | null;
    title?: string;
    subtitle?: string;
    imageKey?: string;
    imageUrl?: string;
    churchId: number;
    updatedBy: number;
  }): Promise<void> {
    await this.upsertOne(data);
  }

  async saveAll(
    items: Array<{
      sectionType: LayoutSectionType;
      status: "visible" | "hidden";
      displayOrder: number;
      colSpan: number;
      gridCols?: number | null;
      title?: string;
      subtitle?: string;
      imageKey?: string;
      imageUrl?: string;
    }>,
    churchId: number,
    updatedBy: number,
  ): Promise<void> {
    const existing = await this.repo.find({ where: { churchId } });
    const existingByType = new Map<LayoutSectionType, LayoutSetting[]>();

    for (const entity of existing) {
      const bucket = existingByType.get(entity.sectionType) ?? [];
      bucket.push(entity);
      existingByType.set(entity.sectionType, bucket);
    }

    const usedIds = new Set<number>();
    const toSave = items.map((item) => {
      const matches = existingByType.get(item.sectionType) ?? [];
      const entity = matches.shift() ?? this.repo.create();

      if (entity.id) {
        usedIds.add(entity.id);
      }

      Object.assign(entity, {
        ...item,
        churchId,
        updatedBy,
      });

      return entity;
    });

    const duplicateIds = existing
      .filter((entity) => !usedIds.has(entity.id))
      .map((entity) => entity.id);

    if (duplicateIds.length > 0) {
      await this.repo.delete(duplicateIds);
    }

    await this.repo.save(toSave);
  }

  async update(id: number, data: Record<string, unknown>): Promise<void> {
    await this.repo.update(id, data);
  }
}

