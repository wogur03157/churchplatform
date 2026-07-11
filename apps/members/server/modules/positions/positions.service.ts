import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Position } from "./position.entity";

@Injectable()
export class PositionsService {
  constructor(
    @InjectRepository(Position)
    private readonly repo: Repository<Position>
  ) {}

  findAll(): Promise<Position[]> {
    return this.repo.find({ order: { displayOrder: "ASC", id: "ASC" } });
  }

  async create(data: { name: string; displayOrder?: number }): Promise<Position> {
    return this.repo.save(this.repo.create({ ...data, isBuiltIn: 0 }));
  }

  async update(id: number, data: Partial<Pick<Position, "name" | "displayOrder">>): Promise<void> {
    const position = await this.repo.findOne({ where: { id } });
    if (!position) throw new NotFoundException("직분을 찾을 수 없습니다");
    Object.assign(position, data);
    await this.repo.save(position);
  }

  async remove(id: number): Promise<void> {
    const position = await this.repo.findOne({ where: { id } });
    if (!position) throw new NotFoundException("직분을 찾을 수 없습니다");
    if (position.isBuiltIn) throw new BadRequestException("기본 직분은 삭제할 수 없습니다");
    await this.repo.remove(position);
  }
}
