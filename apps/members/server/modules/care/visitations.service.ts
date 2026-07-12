import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuditService } from "../audit/audit.service";
import { Visitation, VisitationStatus } from "./care.entities";

@Injectable()
export class VisitationsService {
  constructor(
    @InjectRepository(Visitation)
    private readonly repo: Repository<Visitation>,
    @Inject(AuditService)
    private readonly audit: AuditService
  ) {}

  /** 목록 — canReadContent가 아니면 content를 마스킹해서 반환 */
  async findAll(
    filter: { status?: VisitationStatus; memberId?: number; assignedTo?: number },
    canReadContent: boolean
  ): Promise<Array<Visitation & { hasContent?: boolean }>> {
    const qb = this.repo.createQueryBuilder("v");
    if (filter.status) qb.andWhere("v.status = :status", { status: filter.status });
    if (filter.memberId) qb.andWhere("v.memberId = :memberId", { memberId: filter.memberId });
    if (filter.assignedTo)
      qb.andWhere("v.assignedTo = :assignedTo", { assignedTo: filter.assignedTo });

    const items = await qb.orderBy("v.createdAt", "DESC").getMany();
    if (canReadContent) return items;

    return items.map((v) => {
      const hasContent = v.content !== null && v.content !== "";
      return { ...v, content: null, hasContent };
    });
  }

  async create(
    data: Pick<Visitation, "memberId" | "type" | "scheduledAt" | "reason">,
    actorUserId: number
  ): Promise<Visitation> {
    const saved = await this.repo.save(
      this.repo.create({ ...data, requestedBy: actorUserId, status: "requested" })
    );
    await this.audit.log({
      actorUserId,
      action: "create",
      targetType: "visitation",
      targetId: saved.id,
    });
    return saved;
  }

  async update(
    id: number,
    data: Partial<Pick<Visitation, "assignedTo" | "status" | "scheduledAt" | "type" | "reason" | "content">>,
    actorUserId: number
  ): Promise<void> {
    const visitation = await this.repo.findOne({ where: { id } });
    if (!visitation) throw new NotFoundException("심방을 찾을 수 없습니다");

    // 배정되면 상태 자동 전이
    if (data.assignedTo !== undefined && data.status === undefined && visitation.status === "requested") {
      data.status = data.assignedTo === null ? "requested" : "assigned";
    }

    const changedFields = Object.keys(data);
    Object.assign(visitation, data);
    await this.repo.save(visitation);
    await this.audit.log({
      actorUserId,
      action: "update",
      targetType: "visitation",
      targetId: id,
      detail: { changedFields },
    });
  }
}
