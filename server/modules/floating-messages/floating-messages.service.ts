import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm";
import { FloatingMessage } from "./entities/floating-message.entity";

@Injectable()
export class FloatingMessagesService {
  constructor(
    @InjectRepository(FloatingMessage)
    private readonly repo: Repository<FloatingMessage>
  ) {}

  async findAll(activeOnly = false): Promise<FloatingMessage[]> {
    if (activeOnly) {
      const now = new Date();
      return this.repo.find({
        where: {
          status: "active" as const,
          startDate: LessThanOrEqual(now),
          endDate: MoreThanOrEqual(now),
        },
        order: { createdAt: "DESC" },
      });
    }
    return this.repo.find({ order: { createdAt: "DESC" } });
  }

  async findOne(id: number): Promise<FloatingMessage | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: {
    title: string;
    content: string;
    messageType: "info" | "warning" | "success" | "announcement";
    status: "active" | "inactive";
    startDate?: Date;
    endDate?: Date;
    displayPosition: "top" | "bottom" | "center";
    createdBy: number;
  }): Promise<FloatingMessage> {
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
