import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuditService } from "../audit/audit.service";
import { PastoralNote } from "./care.entities";

@Injectable()
export class PastoralNotesService {
  constructor(
    @InjectRepository(PastoralNote)
    private readonly repo: Repository<PastoralNote>,
    @Inject(AuditService)
    private readonly audit: AuditService
  ) {}

  /** 특정 교인의 목양 메모 — 열람도 감사 로그에 남긴다 */
  async findByMember(memberId: number, actorUserId: number): Promise<PastoralNote[]> {
    const notes = await this.repo.find({
      where: { memberId },
      order: { createdAt: "DESC" },
    });
    await this.audit.log({
      actorUserId,
      action: "view",
      targetType: "pastoral_notes",
      targetId: memberId,
      detail: { count: notes.length },
    });
    return notes;
  }

  async create(memberId: number, content: string, actorUserId: number): Promise<PastoralNote> {
    const saved = await this.repo.save(
      this.repo.create({ memberId, content, authorId: actorUserId })
    );
    await this.audit.log({
      actorUserId,
      action: "create",
      targetType: "pastoral_note",
      targetId: saved.id,
    });
    return saved;
  }

  async remove(id: number, actorUserId: number): Promise<void> {
    const note = await this.repo.findOne({ where: { id } });
    if (!note) throw new NotFoundException("메모를 찾을 수 없습니다");
    await this.repo.remove(note);
    await this.audit.log({
      actorUserId,
      action: "delete",
      targetType: "pastoral_note",
      targetId: id,
    });
  }
}
