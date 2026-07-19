import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as XLSX from "xlsx";
import { AuditService } from "../audit/audit.service";
import { Position } from "../positions/position.entity";
import type { BaptismLevel, FamilyRole, MemberStatus } from "./member.entity";
import { Member } from "./member.entity";

/** 헤더 이름 → 필드 매핑 (엑셀 첫 행 기준, 공백 제거 후 비교) */
const HEADER_ALIASES: Record<string, string> = {
  교적번호: "code",
  교번: "code",
  이름: "name",
  성명: "name",
  성별: "gender",
  생년월일: "birthDate",
  생일: "birthDate",
  연락처: "phone",
  전화번호: "phone",
  휴대폰: "phone",
  주소: "address",
  이메일: "email",
  직분: "position",
  신급: "baptismLevel",
  세례: "baptismLevel",
  상태: "status",
  등록일: "registeredAt",
  등록경로: "registerPath",
  메모: "memo",
  비고: "memo",
};

const GENDER_MAP: Record<string, "m" | "f"> = {
  남: "m", 남자: "m", m: "m", male: "m",
  여: "f", 여자: "f", f: "f", female: "f",
};

const BAPTISM_MAP: Record<string, BaptismLevel> = {
  방문: "visitor", 원입: "wonip", 학습: "haksup",
  세례: "baptized", 입교: "confirmed", 유아세례: "infant",
};

const STATUS_MAP: Record<string, MemberStatus> = {
  출석: "active", 재적: "active", 장기결석: "absent_long",
  이명: "transferred", 별세: "deceased", 제적: "removed",
};

export interface ImportResult {
  created: number;
  duplicated: number;
  errors: { row: number; message: string }[];
  unknownHeaders: string[];
}

@Injectable()
export class MemberExcelService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    @InjectRepository(Position)
    private readonly positionRepo: Repository<Position>,
    @Inject(AuditService)
    private readonly audit: AuditService
  ) {}

  /** base64 엑셀(xlsx/csv)을 파싱해 교인 일괄 등록 */
  async import(fileBase64: string, actorUserId: number): Promise<ImportResult> {
    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(Buffer.from(fileBase64, "base64"), { type: "buffer", cellDates: true });
    } catch {
      throw new BadRequestException("엑셀 파일을 읽을 수 없습니다");
    }
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) throw new BadRequestException("시트가 비어 있습니다");

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });
    if (rows.length === 0) throw new BadRequestException("데이터 행이 없습니다");

    // 헤더 매핑
    const headers = Object.keys(rows[0]);
    const mapping = new Map<string, string>();
    const unknownHeaders: string[] = [];
    for (const header of headers) {
      const field = HEADER_ALIASES[header.replace(/\s/g, "")];
      if (field) mapping.set(header, field);
      else unknownHeaders.push(header);
    }
    if (!Array.from(mapping.values()).includes("name")) {
      throw new BadRequestException("'이름' 열을 찾을 수 없습니다");
    }

    const positions = await this.positionRepo.find();
    const positionByName = new Map(positions.map((p) => [p.name, p.id]));

    // 중복 검사용 기존 명단 (이름+전화 조합) + 교적번호 집합
    const existing = await this.memberRepo.find({ select: ["name", "phone", "code"] });
    const existingKeys = new Set(existing.map((m) => `${m.name}|${m.phone ?? ""}`));
    const usedCodes = new Set(existing.map((m) => m.code).filter((c): c is string => !!c));
    // 자동 발번 시작값 — 숫자형 교적번호 최댓값 + 1
    let nextAuto =
      Math.max(
        0,
        ...existing.map((m) => (m.code && /^[0-9]+$/.test(m.code) ? parseInt(m.code, 10) : 0))
      ) + 1;
    const takeAutoCode = (): string => {
      while (usedCodes.has(String(nextAuto).padStart(4, "0"))) nextAuto++;
      return String(nextAuto++).padStart(4, "0");
    };

    const result: ImportResult = { created: 0, duplicated: 0, errors: [], unknownHeaders };

    for (let i = 0; i < rows.length; i++) {
      const rowNo = i + 2; // 헤더 다음 행부터
      try {
        const raw: Record<string, unknown> = {};
        for (const [header, field] of mapping) raw[field] = rows[i][header];

        const name = String(raw.name ?? "").trim();
        if (!name) {
          result.errors.push({ row: rowNo, message: "이름이 비어 있습니다" });
          continue;
        }

        const phone = raw.phone != null ? String(raw.phone).trim() : null;
        const key = `${name}|${phone ?? ""}`;
        if (existingKeys.has(key)) {
          result.duplicated++;
          continue;
        }

        // 교적번호: 시트에 있으면 사용(중복 시 오류), 없으면 자동 발번
        const rawCode = raw.code != null ? String(raw.code).trim() : "";
        if (rawCode && usedCodes.has(rawCode)) {
          result.errors.push({ row: rowNo, message: `교적번호 중복: ${rawCode}` });
          continue;
        }
        const code = rawCode || takeAutoCode();

        const member = this.memberRepo.create({
          code,
          name,
          phone,
          address: raw.address != null ? String(raw.address).trim() : null,
          email: raw.email != null ? String(raw.email).trim() : null,
          gender: raw.gender != null ? (GENDER_MAP[String(raw.gender).trim()] ?? null) : null,
          birthDate: this.toDateString(raw.birthDate),
          registeredAt: this.toDateString(raw.registeredAt),
          registerPath: raw.registerPath != null ? String(raw.registerPath).trim() : null,
          memo: raw.memo != null ? String(raw.memo).trim() : null,
          baptismLevel:
            raw.baptismLevel != null
              ? (BAPTISM_MAP[String(raw.baptismLevel).trim()] ?? null)
              : null,
          status:
            raw.status != null ? (STATUS_MAP[String(raw.status).trim()] ?? "active") : "active",
          positionId:
            raw.position != null
              ? (positionByName.get(String(raw.position).trim()) ?? null)
              : null,
        });
        await this.memberRepo.save(member);
        existingKeys.add(key);
        usedCodes.add(code);
        result.created++;
      } catch (err) {
        result.errors.push({ row: rowNo, message: `저장 실패: ${err}` });
      }
    }

    await this.audit.log({
      actorUserId,
      action: "create",
      targetType: "member_import",
      detail: { created: result.created, duplicated: result.duplicated, errors: result.errors.length },
    });
    return result;
  }

  /** 전체 교인 명단을 xlsx 버퍼로 생성 */
  async export(actorUserId: number): Promise<Buffer> {
    const members = await this.memberRepo.find({ order: { name: "ASC" } });
    const positions = await this.positionRepo.find();
    const positionName = new Map(positions.map((p) => [p.id, p.name]));

    const genderKo = { m: "남", f: "여" } as const;
    const baptismKo: Record<string, string> = {
      visitor: "방문", wonip: "원입", haksup: "학습",
      baptized: "세례", confirmed: "입교", infant: "유아세례",
    };
    const statusKo: Record<string, string> = {
      active: "출석", absent_long: "장기결석", transferred: "이명",
      deceased: "별세", removed: "제적",
    };

    const rows = members.map((m) => ({
      교적번호: m.code ?? "",
      이름: m.name,
      성별: m.gender ? genderKo[m.gender] : "",
      생년월일: m.birthDate ?? "",
      연락처: m.phone ?? "",
      주소: m.address ?? "",
      이메일: m.email ?? "",
      직분: m.positionId ? (positionName.get(m.positionId) ?? "") : "",
      신급: m.baptismLevel ? baptismKo[m.baptismLevel] : "",
      상태: statusKo[m.status],
      등록일: m.registeredAt ?? "",
      등록경로: m.registerPath ?? "",
      메모: m.memo ?? "",
    }));

    const sheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "교인명단");

    await this.audit.log({
      actorUserId,
      action: "export",
      targetType: "member",
      detail: { count: members.length },
    });
    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  }

  private toDateString(value: unknown): string | null {
    if (value == null || value === "") return null;
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value.toISOString().slice(0, 10);
    }
    const s = String(value).trim().replace(/[./]/g, "-");
    return /^\d{4}-\d{1,2}-\d{1,2}$/.test(s) ? s : null;
  }
}
