import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FinanceAuditLog } from "./finance-audit-log.entity";

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(FinanceAuditLog)
    private readonly repo: Repository<FinanceAuditLog>
  ) {}

  async log(entry: {
    actorUserId: number;
    action: string;
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
