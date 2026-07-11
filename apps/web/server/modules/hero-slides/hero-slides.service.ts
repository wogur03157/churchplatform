import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HeroSlide } from "./entities/hero-slide.entity";

@Injectable()
export class HeroSlidesService {
  constructor(@InjectRepository(HeroSlide) private readonly repo: Repository<HeroSlide>) {}

  findAll(visibleOnly = false): Promise<HeroSlide[]> {
    const where = visibleOnly ? { status: "visible" as const } : {};
    return this.repo.find({ where, order: { displayOrder: "ASC" } });
  }

  findOne(id: number): Promise<HeroSlide | null> {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<HeroSlide>): Promise<HeroSlide> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<HeroSlide>): Promise<HeroSlide | null> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
