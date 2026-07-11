import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuditService } from "../audit/audit.service";
import { Member } from "./member.entity";

export interface MemberListQuery {
  query?: string;
  status?: Member["status"];
  positionId?: number;
  baptismLevel?: Member["baptismLevel"];
  familyId?: number;
  page?: number;
  limit?: number;
}

export interface MemberListResult {
  items: Member[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly repo: Repository<Member>,
    @Inject(AuditService)
    private readonly audit: AuditService
  ) {}

  async findAll(q: MemberListQuery): Promise<MemberListResult> {
    const page = Math.max(1, q.page ?? 1);
    const limit = Math.min(100, Math.max(1, q.limit ?? 20));

    const qb = this.repo.createQueryBuilder("m");
    if (q.query) qb.andWhere("m.name LIKE :name", { name: `%${q.query}%` });
    if (q.status) qb.andWhere("m.status = :status", { status: q.status });
    if (q.positionId) qb.andWhere("m.positionId = :positionId", { positionId: q.positionId });
    if (q.baptismLevel)
      qb.andWhere("m.baptismLevel = :baptismLevel", { baptismLevel: q.baptismLevel });
    if (q.familyId) qb.andWhere("m.familyId = :familyId", { familyId: q.familyId });

    const [items, total] = await qb
      .orderBy("m.name", "ASC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  async findOne(id: number): Promise<Member> {
    const member = await this.repo.findOne({ where: { id } });
    if (!member) throw new NotFoundException("교인을 찾을 수 없습니다");
    return member;
  }

  async create(data: Partial<Member>, actorUserId: number): Promise<Member> {
    const saved = await this.repo.save(this.repo.create(data));
    await this.audit.log({
      actorUserId,
      action: "create",
      targetType: "member",
      targetId: saved.id,
    });
    return saved;
  }

  async update(id: number, data: Partial<Member>, actorUserId: number): Promise<Member> {
    const member = await this.findOne(id);
    // 민감 값 자체는 로그에 남기지 않고 어떤 필드가 바뀌었는지만 기록
    const changedFields = Object.keys(data);
    Object.assign(member, data);
    const saved = await this.repo.save(member);
    await this.audit.log({
      actorUserId,
      action: "update",
      targetType: "member",
      targetId: id,
      detail: { changedFields },
    });
    return saved;
  }

  async remove(id: number, actorUserId: number): Promise<void> {
    const member = await this.findOne(id);
    await this.repo.remove(member);
    await this.audit.log({
      actorUserId,
      action: "delete",
      targetType: "member",
      targetId: id,
      detail: { name: member.name },
    });
  }
}
