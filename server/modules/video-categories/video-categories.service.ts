import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { VideoCategory } from "./entities/video-category.entity";

@Injectable()
export class VideoCategoriesService {
  constructor(@InjectRepository(VideoCategory) private readonly repo: Repository<VideoCategory>) {}

  findAll(): Promise<VideoCategory[]> { return this.repo.find({ order: { displayOrder: "ASC" } }); }
  findOne(id: number): Promise<VideoCategory | null> { return this.repo.findOne({ where: { id } }); }
  create(data: Partial<VideoCategory>): Promise<VideoCategory> { return this.repo.save(this.repo.create(data)); }
  async update(id: number, data: Partial<VideoCategory>): Promise<void> { await this.repo.update(id, data); }
  async remove(id: number): Promise<void> { await this.repo.delete(id); }
}
