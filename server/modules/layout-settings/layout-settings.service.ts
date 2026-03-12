import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LayoutSetting } from "./entities/layout-setting.entity";

@Injectable()
export class LayoutSettingsService {
  constructor(
    @InjectRepository(LayoutSetting)
    private readonly repo: Repository<LayoutSetting>
  ) {}

  async findAll(): Promise<LayoutSetting[]> {
    return this.repo.find({ order: { displayOrder: "ASC" } });
  }

  private async upsertOne(data: {
    sectionType: "announcements" | "images" | "videos" | "hero" | "image_a" | "image_b";
    status: "visible" | "hidden";
    displayOrder: number;
    colSpan?: number;
    title?: string;
    subtitle?: string;
    imageKey?: string;
    imageUrl?: string;
    updatedBy: number;
  }): Promise<void> {
    let entity = await this.repo.findOne({ where: { sectionType: data.sectionType } });
    if (entity) {
      Object.assign(entity, data);
    } else {
      entity = this.repo.create(data);
    }
    await this.repo.save(entity);
  }

  async upsert(data: {
    sectionType: "announcements" | "images" | "videos" | "hero" | "image_a" | "image_b";
    status: "visible" | "hidden";
    displayOrder: number;
    colSpan?: number;
    title?: string;
    subtitle?: string;
    imageKey?: string;
    imageUrl?: string;
    updatedBy: number;
  }): Promise<void> {
    await this.upsertOne(data);
  }

  async saveAll(
    items: Array<{
      sectionType: "announcements" | "images" | "videos" | "hero" | "image_a" | "image_b";
      status: "visible" | "hidden";
      displayOrder: number;
      colSpan: number;
      title?: string;
      subtitle?: string;
      imageKey?: string;
      imageUrl?: string;
    }>,
    updatedBy: number,
  ): Promise<void> {
    await Promise.all(items.map((item) => this.upsertOne({ ...item, updatedBy })));
  }

  async update(id: number, data: Record<string, unknown>): Promise<void> {
    await this.repo.update(id, data);
  }
}
