import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AttendanceRecord, AttendanceSession, AttendanceStatus } from "./attendance.entity";

export interface CheckPayload {
  sessionId: number;
  date: string;
  records: { memberId: number; status?: AttendanceStatus }[];
}

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceSession)
    private readonly sessionRepo: Repository<AttendanceSession>,
    @InjectRepository(AttendanceRecord)
    private readonly recordRepo: Repository<AttendanceRecord>
  ) {}

  // ── 세션 ──────────────────────────────────────────────────────
  findSessions(): Promise<AttendanceSession[]> {
    return this.sessionRepo.find({ order: { displayOrder: "ASC", id: "ASC" } });
  }

  async createSession(data: Partial<AttendanceSession>): Promise<AttendanceSession> {
    return this.sessionRepo.save(this.sessionRepo.create({ ...data, isBuiltIn: 0 }));
  }

  async updateSession(id: number, data: Partial<AttendanceSession>): Promise<void> {
    const session = await this.sessionRepo.findOne({ where: { id } });
    if (!session) throw new NotFoundException("세션을 찾을 수 없습니다");
    Object.assign(session, data);
    await this.sessionRepo.save(session);
  }

  async removeSession(id: number): Promise<void> {
    const session = await this.sessionRepo.findOne({ where: { id } });
    if (!session) throw new NotFoundException("세션을 찾을 수 없습니다");
    if (session.isBuiltIn) throw new BadRequestException("기본 세션은 삭제할 수 없습니다");
    await this.recordRepo.delete({ sessionId: id });
    await this.sessionRepo.remove(session);
  }

  // ── 출석 체크 ─────────────────────────────────────────────────
  /** (세션, 날짜) 단위 일괄 upsert — 모바일 셀리더 체크 화면이 이 API 하나로 동작 */
  async check(payload: CheckPayload, checkedBy: number): Promise<{ saved: number }> {
    if (!payload.sessionId || !payload.date || !Array.isArray(payload.records)) {
      throw new BadRequestException("sessionId, date, records가 필요합니다");
    }
    const session = await this.sessionRepo.findOne({ where: { id: payload.sessionId } });
    if (!session) throw new NotFoundException("세션을 찾을 수 없습니다");

    const entities = payload.records.map((r) =>
      this.recordRepo.create({
        sessionId: payload.sessionId,
        date: payload.date,
        memberId: r.memberId,
        status: r.status ?? "present",
        checkedBy,
      })
    );
    await this.recordRepo.upsert(entities, {
      conflictPaths: ["sessionId", "memberId", "date"],
    });
    return { saved: entities.length };
  }

  /** 특정 세션·날짜의 기록 조회 (체크 화면 초기 로드) */
  findRecords(sessionId: number, date: string): Promise<AttendanceRecord[]> {
    return this.recordRepo.find({ where: { sessionId, date } });
  }

  /** 교인별 출석 이력 */
  findMemberHistory(memberId: number, limit = 52): Promise<AttendanceRecord[]> {
    return this.recordRepo.find({
      where: { memberId },
      order: { date: "DESC" },
      take: limit,
    });
  }

  /** 기간별 세션 출석 통계 (날짜 × 세션 인원) */
  async stats(from: string, to: string, sessionId?: number) {
    const qb = this.recordRepo
      .createQueryBuilder("r")
      .select("DATE_FORMAT(r.date, '%Y-%m-%d')", "date")
      .addSelect("r.sessionId", "sessionId")
      .addSelect("SUM(r.status != 'absent')", "presentCount")
      .where("r.date BETWEEN :from AND :to", { from, to })
      .groupBy("r.date")
      .addGroupBy("r.sessionId")
      .orderBy("r.date", "ASC");
    if (sessionId) qb.andWhere("r.sessionId = :sessionId", { sessionId });
    const rows = await qb.getRawMany<{ date: string; sessionId: number; presentCount: string }>();
    return rows.map((row) => ({
      date: row.date,
      sessionId: Number(row.sessionId),
      presentCount: Number(row.presentCount),
    }));
  }
}
