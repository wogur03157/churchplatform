import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Image } from "./entities/image.entity";

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private readonly repo: Repository<Image>
  ) {}

  async findAll(publishedOnly = false): Promise<Image[]> {
    const query = this.repo.createQueryBuilder("i");
    if (publishedOnly) {
      query.where("i.status = 'published'");
    }
    return query
      .orderBy("i.displayOrder", "ASC")
      .addOrderBy("i.createdAt", "DESC")
      .getMany();
  }

  async findOne(id: number): Promise<Image | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: {
    title: string;
    description?: string;
    fileKey: string;
    url: string;
    mimeType?: string;
    fileSize?: number;
    uploadedBy: number;
    status: "published" | "draft";
    displayOrder: number;
  }): Promise<Image> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(
    id: number,
    data: Partial<{
      title: string;
      description: string | null;
      status: "published" | "draft";
      displayOrder: number;
      showOnHome: boolean;
    }>
  ): Promise<void> {
    await this.repo.update(id, data);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
