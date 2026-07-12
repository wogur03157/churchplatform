import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Member } from "../members/member.entity";
import { MemberGroup, MemberGroupMember } from "./member-group.entity";

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(MemberGroup)
    private readonly groupRepo: Repository<MemberGroup>,
    @InjectRepository(MemberGroupMember)
    private readonly membershipRepo: Repository<MemberGroupMember>,
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>
  ) {}

  /** 전체 조직 (플랫 목록 + 인원수 — 트리는 클라이언트에서 조립) */
  async findAll(): Promise<(MemberGroup & { memberCount: number })[]> {
    const groups = await this.groupRepo.find({
      order: { displayOrder: "ASC", id: "ASC" },
    });
    const counts = await this.membershipRepo
      .createQueryBuilder("gm")
      .select("gm.groupId", "groupId")
      .addSelect("COUNT(*)", "count")
      .groupBy("gm.groupId")
      .getRawMany<{ groupId: number; count: string }>();
    const countMap = new Map(counts.map((c) => [Number(c.groupId), Number(c.count)]));
    return groups.map((g) => ({ ...g, memberCount: countMap.get(g.id) ?? 0 }));
  }

  async create(data: Partial<MemberGroup>): Promise<MemberGroup> {
    if (data.parentId) await this.assertExists(data.parentId);
    return this.groupRepo.save(this.groupRepo.create(data));
  }

  async update(id: number, data: Partial<MemberGroup>): Promise<void> {
    const group = await this.assertExists(id);
    if (data.parentId) {
      if (data.parentId === id) throw new BadRequestException("자기 자신을 상위 조직으로 지정할 수 없습니다");
      await this.assertExists(data.parentId);
    }
    Object.assign(group, data);
    await this.groupRepo.save(group);
  }

  async remove(id: number): Promise<void> {
    const group = await this.assertExists(id);
    const childCount = await this.groupRepo.count({ where: { parentId: id } });
    if (childCount > 0) throw new BadRequestException("하위 조직이 있어 삭제할 수 없습니다");
    await this.membershipRepo.delete({ groupId: id });
    await this.groupRepo.remove(group);
  }

  /** 조직 구성원 명단 */
  async getMembers(groupId: number): Promise<(Member & { groupRole: string })[]> {
    await this.assertExists(groupId);
    const memberships = await this.membershipRepo.find({ where: { groupId } });
    if (memberships.length === 0) return [];
    const members = await this.memberRepo.find({
      where: { id: In(memberships.map((m) => m.memberId)) },
      order: { name: "ASC" },
    });
    const roleMap = new Map(memberships.map((m) => [m.memberId, m.role]));
    return members.map((m) => ({ ...m, groupRole: roleMap.get(m.id) ?? "member" }));
  }

  /** 구성원 배정 (이미 소속이면 무시) */
  async addMembers(groupId: number, memberIds: number[]): Promise<{ added: number }> {
    await this.assertExists(groupId);
    const existing = await this.membershipRepo.find({
      where: { groupId, memberId: In(memberIds) },
    });
    const existingIds = new Set(existing.map((m) => m.memberId));
    const toAdd = memberIds.filter((id) => !existingIds.has(id));
    if (toAdd.length > 0) {
      await this.membershipRepo.save(
        toAdd.map((memberId) => this.membershipRepo.create({ groupId, memberId }))
      );
    }
    return { added: toAdd.length };
  }

  async removeMember(groupId: number, memberId: number): Promise<void> {
    await this.membershipRepo.delete({ groupId, memberId });
  }

  private async assertExists(id: number): Promise<MemberGroup> {
    const group = await this.groupRepo.findOne({ where: { id } });
    if (!group) throw new NotFoundException("조직을 찾을 수 없습니다");
    return group;
  }
}
