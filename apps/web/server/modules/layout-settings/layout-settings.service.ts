import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  type LayoutDisplayVariant,
  LayoutSetting,
  type LayoutSectionType,
} from "./entities/layout-setting.entity";

type LayoutSettingInput = {
  id?: number;
  sectionType: LayoutSectionType;
  status: "visible" | "hidden";
  displayOrder: number;
  colSpan?: number;
  gridCols?: number | null;
  title?: string;
  subtitle?: string;
  imageKey?: string;
  imageUrl?: string;
  sourceCategoryId?: number | null;
  itemLimit?: number | null;
  displayVariant?: LayoutDisplayVariant | null;
};

@Injectable()
export class LayoutSettingsService {
  constructor(
    @InjectRepository(LayoutSetting)
    private readonly repo: Repository<LayoutSetting>,
  ) {}

  /**
   * 전체 조회 — 교회 격리는 테넌트 DB 분리가 담당하므로 churchId 필터를 쓰지 않는다.
   * (과거 단일 DB 시절의 churchId 컬럼은 기록용으로만 남음)
   */
  async findAll(): Promise<LayoutSetting[]> {
    return this.repo.find({ order: { displayOrder: "ASC", id: "ASC" } });
  }

  async saveAll(
    items: LayoutSettingInput[],
    churchId: number,
    updatedBy: number,
  ): Promise<LayoutSetting[]> {
    const existing = await this.repo.find({
      order: { displayOrder: "ASC", id: "ASC" },
    });
    const existingById = new Map(existing.map((item) => [item.id, item] as const));
    const keepIds = new Set<number>();
    const toSave: LayoutSetting[] = [];

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      this.validateSectionInput(item);

      const entity =
        item.id && existingById.has(item.id)
          ? existingById.get(item.id)!
          : this.repo.create();

      if (entity.id) {
        keepIds.add(entity.id);
      }

      Object.assign(entity, {
        sectionType: item.sectionType,
        status: item.status,
        displayOrder: index + 1,
        colSpan: item.colSpan ?? 12,
        gridCols: item.gridCols ?? null,
        title: item.title?.trim() || null,
        subtitle: item.subtitle?.trim() || null,
        imageKey: item.imageKey?.trim() || null,
        imageUrl: item.imageUrl?.trim() || null,
        sourceCategoryId: item.sourceCategoryId ?? null,
        itemLimit: item.itemLimit ?? null,
        displayVariant: item.displayVariant ?? null,
        churchId,
        updatedBy,
      });

      toSave.push(entity);
    }

    const staleIds = existing
      .filter((item) => !keepIds.has(item.id) && !toSave.some((saved) => saved.id === item.id))
      .map((item) => item.id);

    if (staleIds.length > 0) {
      await this.repo.delete(staleIds);
    }

    return this.repo.save(toSave);
  }

  async upsert(
    data: LayoutSettingInput & {
      churchId: number;
      updatedBy: number;
    },
  ): Promise<LayoutSetting> {
    this.validateSectionInput(data);

    const entity =
      data.id
        ? (await this.repo.findOne({ where: { id: data.id } })) ?? this.repo.create()
        : this.repo.create();

    Object.assign(entity, {
      sectionType: data.sectionType,
      status: data.status,
      displayOrder: data.displayOrder,
      colSpan: data.colSpan ?? 12,
      gridCols: data.gridCols ?? null,
      title: data.title?.trim() || null,
      subtitle: data.subtitle?.trim() || null,
      imageKey: data.imageKey?.trim() || null,
      imageUrl: data.imageUrl?.trim() || null,
      sourceCategoryId: data.sourceCategoryId ?? null,
      itemLimit: data.itemLimit ?? null,
      displayVariant: data.displayVariant ?? null,
      churchId: data.churchId,
      updatedBy: data.updatedBy,
    });

    return this.repo.save(entity);
  }

  async update(id: number, data: Partial<LayoutSettingInput> & { updatedBy?: number }): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new BadRequestException("Layout section not found");
    }

    this.validateSectionInput({
      sectionType: (data.sectionType ?? entity.sectionType) as LayoutSectionType,
      status: (data.status ?? entity.status) as "visible" | "hidden",
      displayOrder: data.displayOrder ?? entity.displayOrder,
      colSpan: data.colSpan ?? entity.colSpan,
      gridCols: data.gridCols ?? entity.gridCols,
      title: data.title ?? entity.title ?? undefined,
      subtitle: data.subtitle ?? entity.subtitle ?? undefined,
      imageKey: data.imageKey ?? entity.imageKey ?? undefined,
      imageUrl: data.imageUrl ?? entity.imageUrl ?? undefined,
      sourceCategoryId: data.sourceCategoryId ?? entity.sourceCategoryId ?? undefined,
      itemLimit: data.itemLimit ?? entity.itemLimit ?? undefined,
      displayVariant: (data.displayVariant ?? entity.displayVariant ?? undefined) as LayoutDisplayVariant | undefined,
    });

    Object.assign(entity, {
      ...(data.sectionType !== undefined && { sectionType: data.sectionType }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
      ...(data.colSpan !== undefined && { colSpan: data.colSpan }),
      ...(data.gridCols !== undefined && { gridCols: data.gridCols }),
      ...(data.title !== undefined && { title: data.title?.trim() || null }),
      ...(data.subtitle !== undefined && { subtitle: data.subtitle?.trim() || null }),
      ...(data.imageKey !== undefined && { imageKey: data.imageKey?.trim() || null }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl?.trim() || null }),
      ...(data.sourceCategoryId !== undefined && { sourceCategoryId: data.sourceCategoryId }),
      ...(data.itemLimit !== undefined && { itemLimit: data.itemLimit }),
      ...(data.displayVariant !== undefined && { displayVariant: data.displayVariant }),
      ...(data.updatedBy !== undefined && { updatedBy: data.updatedBy }),
    });

    await this.repo.save(entity);
  }

  private validateSectionInput(input: Partial<LayoutSettingInput>) {
    const sectionType = input.sectionType;
    if (!sectionType) {
      throw new BadRequestException("sectionType is required");
    }

    const requiresCategory =
      sectionType === "content_category" || sectionType === "media_category";

    if (requiresCategory && !input.sourceCategoryId) {
      throw new BadRequestException("sourceCategoryId is required for category sections");
    }

    if (!requiresCategory && input.sourceCategoryId) {
      throw new BadRequestException("sourceCategoryId is only allowed for category sections");
    }

    if (
      (sectionType === "image_a" || sectionType === "image_b") &&
      input.status === "visible" &&
      !input.imageUrl
    ) {
      throw new BadRequestException("imageUrl is required for image sections");
    }
  }
}
