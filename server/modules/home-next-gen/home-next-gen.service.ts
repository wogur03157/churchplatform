import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HomeNextGenItem } from "./entities/home-next-gen-item.entity";

@Injectable()
export class HomeNextGenService {
  constructor(
    @InjectRepository(HomeNextGenItem)
    private readonly repo: Repository<HomeNextGenItem>,
  ) {}

  findAll(churchId?: number | null) {
    const where: any = {};
    if (churchId !== undefined) where.churchId = churchId;
    return this.repo.find({ where, order: { displayOrder: "ASC" } });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<HomeNextGenItem>) {
    const item = this.repo.create(data);
    return this.repo.save(item);
  }

  async update(id: number, data: Partial<HomeNextGenItem>) {
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id } });
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { success: true };
  }
}
