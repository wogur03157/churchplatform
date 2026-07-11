import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Member } from "../members/member.entity";
import { Family } from "./family.entity";

@Injectable()
export class FamiliesService {
  constructor(
    @InjectRepository(Family)
    private readonly repo: Repository<Family>,
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>
  ) {}

  findAll(): Promise<Family[]> {
    return this.repo.find({ order: { id: "ASC" } });
  }

  async findOne(id: number): Promise<Family & { members: Member[] }> {
    const family = await this.repo.findOne({ where: { id } });
    if (!family) throw new NotFoundException("가족을 찾을 수 없습니다");
    const members = await this.memberRepo.find({ where: { familyId: id } });
    return { ...family, members };
  }

  async create(data: { label?: string; headMemberId?: number }): Promise<Family> {
    const family = await this.repo.save(this.repo.create(data));
    if (data.headMemberId) {
      await this.memberRepo.update(
        { id: data.headMemberId },
        { familyId: family.id, familyRole: "head" }
      );
    }
    return family;
  }

  async update(
    id: number,
    data: Partial<Pick<Family, "label" | "headMemberId">>
  ): Promise<void> {
    const family = await this.repo.findOne({ where: { id } });
    if (!family) throw new NotFoundException("가족을 찾을 수 없습니다");
    Object.assign(family, data);
    await this.repo.save(family);
  }

  /** 가족 해체 — 구성원의 familyId를 해제하고 가족 레코드 삭제 */
  async remove(id: number): Promise<void> {
    const family = await this.repo.findOne({ where: { id } });
    if (!family) throw new NotFoundException("가족을 찾을 수 없습니다");
    await this.memberRepo.update({ familyId: id }, { familyId: null, familyRole: null });
    await this.repo.remove(family);
  }
}
