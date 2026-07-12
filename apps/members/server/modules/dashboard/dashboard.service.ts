import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, MoreThanOrEqual, Repository } from "typeorm";
import { AttendanceRecord } from "../attendance/attendance.entity";
import { Member } from "../members/member.entity";
import { NewcomerProgress, NewcomerStage } from "../newcomers/newcomer.entity";

function dateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    @InjectRepository(AttendanceRecord)
    private readonly recordRepo: Repository<AttendanceRecord>,
    @InjectRepository(NewcomerStage)
    private readonly stageRepo: Repository<NewcomerStage>,
    @InjectRepository(NewcomerProgress)
    private readonly progressRepo: Repository<NewcomerProgress>
  ) {}

  async summary(absentWeeks = 4) {
    const [statusCounts, absentees, birthdays, newcomers] = await Promise.all([
      this.statusCounts(),
      this.longTermAbsentees(absentWeeks),
      this.upcomingBirthdays(),
      this.newcomerCounts(),
    ]);
    return { statusCounts, absentees, birthdays, newcomers, absentWeeks };
  }

  /** 재적 상태별 인원 */
  private async statusCounts() {
    const rows = await this.memberRepo
      .createQueryBuilder("m")
      .select("m.status", "status")
      .addSelect("COUNT(*)", "count")
      .groupBy("m.status")
      .getRawMany<{ status: string; count: string }>();
    return Object.fromEntries(rows.map((r) => [r.status, Number(r.count)]));
  }

  /**
   * 장기결석 감지 — 최근 N주간 출석 기록이 하나도 없는 active 교인.
   * 그 기간에 교회 전체 출석 기록이 아예 없으면(출석체크 미사용) 빈 목록 반환.
   */
  private async longTermAbsentees(weeks: number) {
    const since = dateString(weeks * 7);

    const anyRecords = await this.recordRepo.count({
      where: { date: MoreThanOrEqual(since) },
    });
    if (anyRecords === 0) return [];

    const attended = await this.recordRepo
      .createQueryBuilder("r")
      .select("DISTINCT r.memberId", "memberId")
      .where("r.date >= :since", { since })
      .andWhere("r.status != 'absent'")
      .getRawMany<{ memberId: number }>();
    const attendedIds = attended.map((r) => Number(r.memberId));

    const qb = this.memberRepo
      .createQueryBuilder("m")
      .where("m.status = 'active'")
      .orderBy("m.name", "ASC")
      .take(50);
    if (attendedIds.length > 0) qb.andWhere("m.id NOT IN (:...ids)", { ids: attendedIds });

    const members = await qb.getMany();
    return members.map((m) => ({ id: m.id, name: m.name, phone: m.phone, status: m.status }));
  }

  /** 이번 주(오늘부터 7일) 생일자 — 월-일 기준 */
  private async upcomingBirthdays() {
    const targets = new Set<string>();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      targets.add(d.toISOString().slice(5, 10)); // MM-DD
    }
    const members = await this.memberRepo
      .createQueryBuilder("m")
      .where("m.birthDate IS NOT NULL")
      .andWhere("m.status = 'active'")
      .andWhere("DATE_FORMAT(m.birthDate, '%m-%d') IN (:...targets)", {
        targets: [...targets],
      })
      .orderBy("DATE_FORMAT(m.birthDate, '%m-%d')", "ASC")
      .getMany();
    return members.map((m) => ({ id: m.id, name: m.name, birthDate: m.birthDate }));
  }

  /** 새가족 단계별 인원 */
  private async newcomerCounts() {
    const stages = await this.stageRepo.find({ order: { displayOrder: "ASC" } });
    if (stages.length === 0) return [];
    const rows = await this.progressRepo
      .createQueryBuilder("p")
      .select("p.stageId", "stageId")
      .addSelect("COUNT(*)", "count")
      .where({ stageId: In(stages.map((s) => s.id)) })
      .groupBy("p.stageId")
      .getRawMany<{ stageId: number; count: string }>();
    const countMap = new Map(rows.map((r) => [Number(r.stageId), Number(r.count)]));
    return stages.map((s) => ({ stageId: s.id, name: s.name, count: countMap.get(s.id) ?? 0 }));
  }
}
