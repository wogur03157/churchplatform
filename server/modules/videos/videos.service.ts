import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Video } from "./entities/video.entity";

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private readonly repo: Repository<Video>
  ) {}

  async findAll(publishedOnly = false): Promise<Video[]> {
    const query = this.repo.createQueryBuilder("v");
    if (publishedOnly) {
      query.where("v.status = 'published'");
    }
    return query
      .orderBy("v.displayOrder", "ASC")
      .addOrderBy("v.createdAt", "DESC")
      .getMany();
  }

  async findOne(id: number): Promise<Video | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: {
    title: string;
    description?: string;
    videoType: "upload" | "youtube" | "vimeo" | "url";
    url: string;
    fileKey?: string;
    thumbnailUrl?: string;
    mimeType?: string;
    fileSize?: number;
    duration?: number;
    uploadedBy: number;
    status: "published" | "draft";
    displayOrder: number;
    category?: string;
  }): Promise<Video> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: number, data: Record<string, unknown>): Promise<void> {
    await this.repo.update(id, data);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
