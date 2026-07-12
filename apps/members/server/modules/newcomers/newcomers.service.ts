import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Member } from "../members/member.entity";
import { NewcomerProgress, NewcomerStage } from "./newcomer.entity";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

@Injectable()
export class NewcomersService {
  constructor(
    @InjectRepository(NewcomerStage)
    private readonly stageRepo: Repository<NewcomerStage>,
    @InjectRepository(NewcomerProgress)
    private readonly progressRepo: Repository<NewcomerProgress>,
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>
  ) {}

  /** 칸반 보드 — 단계별로 카드(교인 요약 + 경과일) 묶음 */
  async board() {
    const stages = await this.stageRepo.find({ order: { displayOrder: "ASC", id: "ASC" } });
    const progresses = await this.progressRepo.find({ order: { enteredStageAt: "ASC" } });
    const memberIds = progresses.map((p) => p.memberId);
    const members = memberIds.length
      ? await this.memberRepo.find({ where: { id: In(memberIds) } })
      : [];
    const memberMap = new Map(members.map((m) => [m.id, m]));

    const now = Date.now();
    return stages.map((stage) => ({
      ...stage,
      cards: progresses
        .filter((p) => p.stageId === stage.id)
        .map((p) => {
          const member = memberMap.get(p.memberId);
          const entered = p.enteredStageAt ? new Date(p.enteredStageAt).getTime() : now;
          return {
            id: p.id,
            memberId: p.memberId,
            memberName: member?.name ?? "(삭제된 교인)",
            phone: member?.phone ?? null,
            registeredAt: member?.registeredAt ?? null,
            assignedTo: p.assignedTo,
            note: p.note,
            enteredStageAt: p.enteredStageAt,
            daysInStage: Math.max(0, Math.floor((now - entered) / 86_400_000)),
            completedAt: p.completedAt,
          };
        }),
    }));
  }

  /** 새가족 등록 — 첫 단계 카드 생성 */
  async add(memberId: number, assignedTo?: number): Promise<NewcomerProgress> {
    const member = await this.memberRepo.findOne({ where: { id: memberId } });
    if (!member) throw new NotFoundException("교인을 찾을 수 없습니다");
    const existing = await this.progressRepo.findOne({ where: { memberId } });
    if (existing) throw new BadRequestException("이미 새가족 보드에 있는 교인입니다");

    const firstStage = await this.stageRepo.findOne({
      where: {},
      order: { displayOrder: "ASC", id: "ASC" },
    });
    if (!firstStage) throw new BadRequestException("새가족 단계가 설정되어 있지 않습니다");

    return this.progressRepo.save(
      this.progressRepo.create({
        memberId,
        stageId: firstStage.id,
        assignedTo: assignedTo ?? null,
        enteredStageAt: today(),
      })
    );
  }

  /** 단계 이동/담당자/메모 수정 — 최종 단계 도달 시 완료일 기록 */
  async update(
    id: number,
    data: { stageId?: number; assignedTo?: number | null; note?: string | null }
  ): Promise<void> {
    const progress = await this.progressRepo.findOne({ where: { id } });
    if (!progress) throw new NotFoundException("카드를 찾을 수 없습니다");

    if (data.stageId !== undefined && data.stageId !== progress.stageId) {
      const stage = await this.stageRepo.findOne({ where: { id: data.stageId } });
      if (!stage) throw new NotFoundException("단계를 찾을 수 없습니다");
      progress.stageId = stage.id;
      progress.enteredStageAt = today();
      progress.completedAt = stage.isFinal ? today() : null;
    }
    if (data.assignedTo !== undefined) progress.assignedTo = data.assignedTo;
    if (data.note !== undefined) progress.note = data.note;

    await this.progressRepo.save(progress);
  }

  async remove(id: number): Promise<void> {
    await this.progressRepo.delete({ id });
  }

  // ── 단계 관리 ────────────────────────────────────────────────
  findStages(): Promise<NewcomerStage[]> {
    return this.stageRepo.find({ order: { displayOrder: "ASC", id: "ASC" } });
  }

  async createStage(data: Partial<NewcomerStage>): Promise<NewcomerStage> {
    return this.stageRepo.save(this.stageRepo.create({ ...data, isBuiltIn: 0 }));
  }

  async updateStage(id: number, data: Partial<NewcomerStage>): Promise<void> {
    const stage = await this.stageRepo.findOne({ where: { id } });
    if (!stage) throw new NotFoundException("단계를 찾을 수 없습니다");
    Object.assign(stage, data);
    await this.stageRepo.save(stage);
  }

  async removeStage(id: number): Promise<void> {
    const stage = await this.stageRepo.findOne({ where: { id } });
    if (!stage) throw new NotFoundException("단계를 찾을 수 없습니다");
    if (stage.isBuiltIn) throw new BadRequestException("기본 단계는 삭제할 수 없습니다");
    const inUse = await this.progressRepo.count({ where: { stageId: id } });
    if (inUse > 0) throw new BadRequestException("이 단계에 카드가 있어 삭제할 수 없습니다");
    await this.stageRepo.remove(stage);
  }
}
