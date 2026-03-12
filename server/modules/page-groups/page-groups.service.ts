import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PageGroup } from "./entities/page-group.entity";

@Injectable()
export class PageGroupsService {
  constructor(@InjectRepository(PageGroup) private readonly repo: Repository<PageGroup>) {}

  findAll(groupKey?: string): Promise<PageGroup[]> {
    const where = groupKey ? { groupKey } : {};
    return this.repo.find({ where, order: { displayOrder: "ASC" } });
  }

  findOne(id: number): Promise<PageGroup | null> {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<PageGroup>): Promise<PageGroup> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<PageGroup>): Promise<void> {
    await this.repo.update(id, data);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
