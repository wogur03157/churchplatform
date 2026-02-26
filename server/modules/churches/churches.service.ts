import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Church } from "./entities/church.entity";
import { ChurchAdmin } from "./entities/church-admin.entity";
import { ChurchFeature, ALL_FEATURES } from "./entities/church-feature.entity";
import { User } from "../users/entities/user.entity";
import { ApplyChurchDto } from "./dto/apply-church.dto";
import { ReviewChurchDto } from "./dto/review-church.dto";
import { UpdateChurchDto } from "./dto/update-church.dto";

@Injectable()
export class ChurchesService {
  constructor(
    @InjectRepository(Church)
    private readonly churchRepo: Repository<Church>,
    @InjectRepository(ChurchAdmin)
    private readonly churchAdminRepo: Repository<ChurchAdmin>,
    @InjectRepository(ChurchFeature)
    private readonly churchFeatureRepo: Repository<ChurchFeature>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // ── 신청 ──────────────────────────────────────────────────────────────────

  async apply(dto: ApplyChurchDto, applicantId: number): Promise<Church> {
    const existing = await this.churchRepo.findOne({ where: { slug: dto.slug } });
    if (existing) throw new BadRequestException("이미 사용 중인 slug입니다");

    const church = this.churchRepo.create({
      ...dto,
      status: "pending",
      appliedBy: applicantId,
    });
    return this.churchRepo.save(church);
  }

  // ── 목록 / 조회 ───────────────────────────────────────────────────────────

  async findAll(status?: string): Promise<Church[]> {
    const where = status ? { status: status as any } : {};
    return this.churchRepo.find({ where, order: { createdAt: "DESC" } });
  }

  async findBySlug(slug: string): Promise<Church | null> {
    return this.churchRepo.findOne({ where: { slug, status: "active" } });
  }

  async findOne(id: number): Promise<Church> {
    const church = await this.churchRepo.findOne({ where: { id } });
    if (!church) throw new NotFoundException("교회를 찾을 수 없습니다");
    return church;
  }

  // 해당 user가 관리하는 교회 목록
  async findByAdmin(userId: number): Promise<Church[]> {
    const mappings = await this.churchAdminRepo.find({ where: { userId } });
    if (mappings.length === 0) return [];
    const ids = mappings.map((m) => m.churchId);
    return this.churchRepo.findByIds(ids);
  }

  // ── 승인 / 거절 ───────────────────────────────────────────────────────────

  async review(id: number, dto: ReviewChurchDto, reviewerId: number): Promise<Church> {
    const church = await this.findOne(id);
    if (church.status !== "pending") {
      throw new BadRequestException("대기 중인 신청만 처리할 수 있습니다");
    }

    church.status = dto.action;
    church.approvedBy = reviewerId;
    church.approvedAt = new Date();
    if (dto.action === "rejected") church.rejectedReason = dto.rejectedReason ?? null;

    await this.churchRepo.save(church);

    if (dto.action === "active") {
      // 신청자를 church_admin으로 등록
      if (church.appliedBy) {
        await this.addAdmin(id, church.appliedBy);
        await this.userRepo.update({ id: church.appliedBy }, { role: "church_admin" });
      }
      // 기본 기능 플래그 생성
      await this.initFeatures(id, reviewerId);
    }

    return church;
  }

  private async initFeatures(churchId: number, updatedBy: number): Promise<void> {
    const entries = ALL_FEATURES.map((featureKey) =>
      this.churchFeatureRepo.create({ churchId, featureKey, isEnabled: 1, updatedBy }),
    );
    await this.churchFeatureRepo.upsert(entries, { conflictPaths: ["churchId", "featureKey"] });
  }

  // ── 수정 / 정지 ───────────────────────────────────────────────────────────

  async update(id: number, dto: UpdateChurchDto): Promise<Church> {
    const church = await this.findOne(id);
    Object.assign(church, dto);
    return this.churchRepo.save(church);
  }

  // ── 관리자 지정 ───────────────────────────────────────────────────────────

  async getAdmins(churchId: number): Promise<User[]> {
    const mappings = await this.churchAdminRepo.find({ where: { churchId } });
    if (mappings.length === 0) return [];
    const ids = mappings.map((m) => m.userId);
    return this.userRepo.findByIds(ids);
  }

  async addAdmin(churchId: number, userId: number): Promise<void> {
    await this.churchAdminRepo.upsert(
      { churchId, userId },
      { conflictPaths: ["churchId", "userId"] },
    );
  }

  async removeAdmin(churchId: number, userId: number): Promise<void> {
    await this.churchAdminRepo.delete({ churchId, userId });
  }

  // ── 기능 플래그 ───────────────────────────────────────────────────────────

  async getFeatures(churchId: number): Promise<ChurchFeature[]> {
    return this.churchFeatureRepo.find({ where: { churchId } });
  }

  async setFeature(
    churchId: number,
    featureKey: string,
    isEnabled: boolean,
    updatedBy: number,
  ): Promise<ChurchFeature> {
    await this.churchFeatureRepo.upsert(
      { churchId, featureKey: featureKey as any, isEnabled: isEnabled ? 1 : 0, updatedBy },
      { conflictPaths: ["churchId", "featureKey"] },
    );
    return this.churchFeatureRepo.findOneOrFail({ where: { churchId, featureKey: featureKey as any } });
  }

  // 특정 교회에서 기능이 활성화되어 있는지 확인
  async isFeatureEnabled(churchId: number, featureKey: string): Promise<boolean> {
    const feature = await this.churchFeatureRepo.findOne({
      where: { churchId, featureKey: featureKey as any },
    });
    return feature ? feature.isEnabled === 1 : true; // 기록 없으면 기본 활성
  }
}
