import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Announcement } from "./entities/announcement.entity";

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly repo: Repository<Announcement>
  ) {}

  async findAll(publishedOnly = false): Promise<Announcement[]> {
    const query = this.repo.createQueryBuilder("a");
    if (publishedOnly) {
      query.where("a.status = 'published'");
    }
    return query.orderBy("a.createdAt", "DESC").getMany();
  }

  async findOne(id: number): Promise<Announcement | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: {
    title: string;
    content: string;
    authorId: number;
    status: "published" | "draft";
    publishedAt?: Date;
  }): Promise<Announcement> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(
    id: number,
    data: Partial<{
      title: string;
      content: string;
      status: "published" | "draft";
      publishedAt: Date | null;
    }>
  ): Promise<void> {
    await this.repo.update(id, data);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
