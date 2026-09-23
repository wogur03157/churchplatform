import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { HomeCanaan } from "./entities/home-canaan.entity";

@Injectable()
export class HomeCanaanService {
  constructor(
    @InjectRepository(HomeCanaan)
    private readonly repo: Repository<HomeCanaan>,
  ) {}

  findOne(churchId?: number | null) {
    if (churchId != null) {
      return this.repo.findOne({ where: { churchId } });
    }
    return this.repo.findOne({ where: { churchId: IsNull() } });
  }

  async upsert(data: Partial<HomeCanaan>) {
    const existing = await this.findOne(
      data.churchId !== undefined ? data.churchId : null,
    );
    if (existing) {
      await this.repo.update(existing.id, data);
      return this.repo.findOne({ where: { id: existing.id } });
    }
    const item = this.repo.create(data);
    return this.repo.save(item);
  }
}
