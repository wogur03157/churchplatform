import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Popup } from "./entities/popup.entity";

@Injectable()
export class PopupsService {
  constructor(
    @InjectRepository(Popup)
    private readonly repo: Repository<Popup>
  ) {}

  findAll(activeOnly = false): Promise<Popup[]> {
    const q = this.repo.createQueryBuilder("p");
    if (activeOnly) {
      q.where("p.status = 'active'")
        .andWhere("(p.startDate IS NULL OR p.startDate <= NOW())")
        .andWhere("(p.endDate IS NULL OR p.endDate >= NOW())");
    }
    return q.orderBy("p.createdAt", "DESC").getMany();
  }

  findOne(id: number): Promise<Popup | null> {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<Popup>): Promise<Popup> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<Popup>): Promise<void> {
    await this.repo.update(id, data);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
