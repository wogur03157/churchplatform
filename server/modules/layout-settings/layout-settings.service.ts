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

  async upsert(data: {
    sectionType: "announcements" | "images" | "videos" | "hero";
    isVisible: number;
    displayOrder: number;
    title?: string;
    subtitle?: string;
    updatedBy: number;
  }): Promise<void> {
    await this.repo.upsert(data, { conflictPaths: ["sectionType"] });
  }

  async update(id: number, data: Record<string, unknown>): Promise<void> {
    await this.repo.update(id, data);
  }
}
