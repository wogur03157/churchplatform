import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { randomBytes } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import { join, normalize } from "path";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { AuditService } from "../audit/audit.service";
import { Member } from "./member.entity";
import { nextMemberCode } from "./member-code.util";

function isDupCode(err: unknown): boolean {
  return (err as { code?: string })?.code === "ER_DUP_ENTRY";
}

export interface MemberListQuery {
  query?: string;
  /** 단일 상태 또는 콤마 구분 다중 상태 (예: "active,absent_long" — 출석 로스터용) */
  status?: string;
  positionId?: number;
  baptismLevel?: Member["baptismLevel"];
  familyId?: number;
  page?: number;
  limit?: number;
}

const MEMBER_STATUSES = ["active", "absent_long", "transferred", "deceased", "removed"];

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
    // 페이지 목록은 보통 20~50이지만, 출석·영수증 등은 전체 명단(로스터)이 필요해
    // 큰 limit을 요청한다. 상한을 넉넉히 둬서 명단이 조용히 잘리지 않게 한다.
    const limit = Math.min(5000, Math.max(1, q.limit ?? 20));

    const qb = this.repo.createQueryBuilder("m");
    if (q.query) qb.andWhere("m.name LIKE :name", { name: `%${q.query}%` });
    if (q.status) {
      // 유효한 상태값만 통과 (잘못된 입력이 쿼리에 흘러가지 않도록)
      const statuses = q.status.split(",").filter((s) => MEMBER_STATUSES.includes(s));
      if (statuses.length === 1) qb.andWhere("m.status = :status", { status: statuses[0] });
      else if (statuses.length > 1) qb.andWhere("m.status IN (:...statuses)", { statuses });
    }
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

  private nextCode(): Promise<string> {
    return nextMemberCode(this.repo);
  }

  async create(data: Partial<Member>, actorUserId: number): Promise<Member> {
    const manualCode = typeof data.code === "string" ? data.code.trim() : "";
    // 자동 발번은 동시 등록 시 충돌할 수 있어 재시도, 수동 입력은 즉시 중복 안내
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = manualCode || (await this.nextCode());
      try {
        const saved = await this.repo.save(this.repo.create({ ...data, code }));
        await this.audit.log({
          actorUserId,
          action: "create",
          targetType: "member",
          targetId: saved.id,
        });
        return saved;
      } catch (err) {
        if (!isDupCode(err)) throw err;
        if (manualCode) throw new BadRequestException("이미 사용 중인 교적번호입니다");
        // 자동 발번 충돌 → 다시 번호를 계산해 재시도
      }
    }
    throw new BadRequestException("교적번호 발번에 실패했습니다. 다시 시도해주세요");
  }

  async update(id: number, data: Partial<Member>, actorUserId: number): Promise<Member> {
    const member = await this.findOne(id);
    if (typeof data.code === "string") data.code = data.code.trim() || null;
    // 민감 값 자체는 로그에 남기지 않고 어떤 필드가 바뀌었는지만 기록
    const changedFields = Object.keys(data);
    Object.assign(member, data);
    let saved: Member;
    try {
      saved = await this.repo.save(member);
    } catch (err) {
      if (isDupCode(err)) throw new BadRequestException("이미 사용 중인 교적번호입니다");
      throw err;
    }
    await this.audit.log({
      actorUserId,
      action: "update",
      targetType: "member",
      targetId: id,
      detail: { changedFields },
    });
    return saved;
  }

  /** 교적번호 없는 기존 교인에게 순번 부여 (마이그레이션·프로비저닝 시 호출) */
  async backfillCodes(): Promise<number> {
    const missing = await this.repo.find({
      where: { code: IsNull() },
      order: { id: "ASC" },
      select: ["id"],
    });
    let assigned = 0;
    for (const m of missing) {
      await this.repo.update(m.id, { code: await this.nextCode() });
      assigned++;
    }
    return assigned;
  }

  // ── 사진 ────────────────────────────────────────────
  // 업로드로만 photoUrl이 설정되도록 컨트롤러에서 create/update 바디의 photoUrl을 제거한다.

  private static readonly PHOTO_MIME_EXT: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  private safeSlug(churchSlug?: string | null): string {
    return (churchSlug ?? "default").replace(/[^a-z0-9-]/gi, "_");
  }

  async setPhoto(
    id: number,
    file: { fileBase64: string; mimeType: string },
    actorUserId: number,
    churchSlug?: string | null
  ): Promise<string> {
    const member = await this.findOne(id);
    const ext = MembersService.PHOTO_MIME_EXT[file.mimeType];
    if (!ext) throw new BadRequestException("사진은 JPG/PNG/WebP 형식만 가능합니다");

    const base64 = file.fileBase64.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(base64, "base64");
    if (buffer.length === 0) throw new BadRequestException("파일이 비어 있습니다");
    if (buffer.length > 5 * 1024 * 1024) {
      throw new BadRequestException("사진은 5MB 이하여야 합니다");
    }

    const slug = this.safeSlug(churchSlug);
    const fileKey = `${slug}/members/${id}-${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
    await mkdir(join(process.cwd(), "uploads", slug, "members"), { recursive: true });
    await writeFile(join(process.cwd(), "uploads", fileKey), buffer);

    const oldKey = member.photoUrl;
    member.photoUrl = fileKey;
    await this.repo.save(member);
    if (oldKey) await unlink(join(process.cwd(), "uploads", oldKey)).catch(() => {});

    await this.audit.log({
      actorUserId,
      action: "update",
      targetType: "member",
      targetId: id,
      detail: { changedFields: ["photoUrl"] },
    });
    return fileKey;
  }

  /** 사진 파일 경로 — 자기 교회(slug 접두사) 파일만, 경로 이탈 차단 */
  async getPhotoFile(
    id: number,
    churchSlug?: string | null
  ): Promise<{ path: string; mimeType: string }> {
    const member = await this.findOne(id);
    if (!member.photoUrl) throw new NotFoundException("등록된 사진이 없습니다");

    const slug = this.safeSlug(churchSlug);
    const key = normalize(member.photoUrl);
    if (key.includes("..") || !key.startsWith(`${slug}/`)) {
      throw new NotFoundException("등록된 사진이 없습니다");
    }
    const ext = key.split(".").pop() ?? "";
    const mimeType =
      Object.entries(MembersService.PHOTO_MIME_EXT).find(([, e]) => e === ext)?.[0] ??
      "application/octet-stream";
    return { path: join(process.cwd(), "uploads", key), mimeType };
  }

  async removePhoto(id: number, actorUserId: number): Promise<void> {
    const member = await this.findOne(id);
    if (!member.photoUrl) return;
    const oldKey = member.photoUrl;
    member.photoUrl = null;
    await this.repo.save(member);
    await unlink(join(process.cwd(), "uploads", normalize(oldKey))).catch(() => {});
    await this.audit.log({
      actorUserId,
      action: "update",
      targetType: "member",
      targetId: id,
      detail: { changedFields: ["photoUrl"] },
    });
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
