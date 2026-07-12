import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuditService } from "../audit/audit.service";
import { ClosingLock } from "./closing-lock.entity";

@Injectable()
export class ClosingsService {
  constructor(
    @InjectRepository(ClosingLock)
    private readonly repo: Repository<ClosingLock>,
    @Inject(AuditService)
    private readonly audit: AuditService
  ) {}

  findByYear(year: number): Promise<ClosingLock[]> {
    return this.repo.find({ where: { year }, order: { month: "ASC" } });
  }

  /** 해당 날짜(YYYY-MM-DD)가 마감된 월/연에 속하는지 */
  async isLocked(date: string): Promise<boolean> {
    const [yearStr, monthStr] = date.split("-");
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    const lock = await this.repo
      .createQueryBuilder("c")
      .where("c.year = :year AND (c.month = :month OR c.month IS NULL)", { year, month })
      .getOne();
    return lock !== null;
  }

  /** 마감 검사 — 잠겨 있으면 400. 금전 기록을 쓰는 서비스가 호출한다 */
  async assertNotLocked(date: string): Promise<void> {
    if (await this.isLocked(date)) {
      const month = parseInt(date.split("-")[1]);
      throw new BadRequestException(
        `${month}월은 마감되어 기록을 변경할 수 없습니다 (마감 해제 후 처리)`
      );
    }
  }

  async lock(year: number, month: number | null, actorUserId: number): Promise<ClosingLock> {
    if (month !== null && (month < 1 || month > 12)) {
      throw new BadRequestException("월은 1~12 사이여야 합니다");
    }
    const existing = await this.repo.findOne({
      where: { year, month: month === null ? undefined : month },
    });
    if (existing && existing.month === month) {
      throw new BadRequestException("이미 마감되어 있습니다");
    }
    const lock = await this.repo.save(this.repo.create({ year, month, lockedBy: actorUserId }));
    await this.audit.log({
      actorUserId,
      action: "lock",
      targetType: "closing",
      targetId: lock.id,
      detail: { year, month },
    });
    return lock;
  }

  async unlock(id: number, actorUserId: number): Promise<void> {
    const lock = await this.repo.findOne({ where: { id } });
    if (!lock) throw new NotFoundException("마감 기록을 찾을 수 없습니다");
    await this.repo.remove(lock);
    await this.audit.log({
      actorUserId,
      action: "unlock",
      targetType: "closing",
      targetId: id,
      detail: { year: lock.year, month: lock.month },
    });
  }
}
