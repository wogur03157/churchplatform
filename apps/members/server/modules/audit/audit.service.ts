import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MemberAuditLog } from "./member-audit-log.entity";

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(MemberAuditLog)
    private readonly repo: Repository<MemberAuditLog>
  ) {}

  async log(entry: {
    actorUserId: number;
    action: MemberAuditLog["action"];
    targetType: string;
    targetId?: number | null;
    detail?: Record<string, unknown> | null;
  }): Promise<void> {
    await this.repo.save(
      this.repo.create({
        actorUserId: entry.actorUserId,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId ?? null,
        detail: entry.detail ?? null,
      })
    );
  }
}
