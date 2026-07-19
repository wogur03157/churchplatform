import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import type { FamilyRole } from "../members/member.entity";
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

  /**
   * 두 교인을 같은 가족으로 묶는다 (한 트랜잭션).
   * withMemberId에게 가족이 있으면 그 가족에 합류, 없으면 새 가족을 만들어 세대주로 둔다.
   * 프론트에서 "가족 생성 → 교인 수정" 2단계로 하던 것을 서버 트랜잭션으로 대체해
   * 중간 실패 시 남는 고아 가족 레코드를 방지한다.
   */
  async linkMembers(
    memberId: number,
    withMemberId: number,
    role: FamilyRole
  ): Promise<{ familyId: number }> {
    if (memberId === withMemberId) {
      throw new BadRequestException("같은 교인을 가족으로 연결할 수 없습니다");
    }
    return this.repo.manager.transaction(async (mgr) => {
      const memberRepo = mgr.getRepository(Member);
      const familyRepo = mgr.getRepository(Family);
      const [member, other] = await Promise.all([
        memberRepo.findOne({ where: { id: memberId } }),
        memberRepo.findOne({ where: { id: withMemberId } }),
      ]);
      if (!member || !other) throw new NotFoundException("교인을 찾을 수 없습니다");

      let familyId = other.familyId;
      if (!familyId) {
        const family = await familyRepo.save(
          familyRepo.create({ label: `${other.name} 가정`, headMemberId: other.id })
        );
        familyId = family.id;
        await memberRepo.update(other.id, {
          familyId,
          familyRole: other.familyRole ?? "head",
        });
      }
      await memberRepo.update(memberId, { familyId, familyRole: role });
      return { familyId };
    });
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
