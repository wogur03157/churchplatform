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

  async findAll(churchId?: number): Promise<LayoutSetting[]> {
    // churchId가 없으면 기본적으로 1번 교회를 조회하거나 전체를 조회 (하위 호환성)
    const where = churchId ? { churchId } : {};
    return this.repo.find({ where, order: { displayOrder: "ASC" } });
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
    churchId: number;
    updatedBy: number;
  }): Promise<void> {
    // churchId와 sectionType의 조합으로 유니크하게 조회
    let entity = await this.repo.findOne({ 
      where: { 
        churchId: data.churchId, 
        sectionType: data.sectionType 
      } 
    });
    
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
    churchId: number;
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
    churchId: number,
    updatedBy: number,
  ): Promise<void> {
    await Promise.all(items.map((item) => this.upsertOne({ ...item, churchId, updatedBy })));
  }

  async update(id: number, data: Record<string, unknown>): Promise<void> {
    await this.repo.update(id, data);
  }
}
