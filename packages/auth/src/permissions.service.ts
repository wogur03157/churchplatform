import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AdminPermission, ChurchFeature } from "@platform/entities";

/**
 * 관리자 개인 권한(admin_permissions)·교회 기능 플래그(church_features) 조회.
 * 가드뿐 아니라 서비스에서 필드 단위 마스킹(예: 심방 내용)에도 사용한다.
 */
@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(AdminPermission)
    private readonly permissionRepo: Repository<AdminPermission>,
    @InjectRepository(ChurchFeature)
    private readonly featureRepo: Repository<ChurchFeature>
  ) {}

  /** 교회 기능 플래그 — 행이 없으면 허용(기존 교회 하위호환) */
  async isFeatureEnabled(churchId: number, featureKey: string): Promise<boolean> {
    const feature = await this.featureRepo.findOne({
      where: { churchId, featureKey: featureKey as never },
    });
    return !feature || feature.status === "enabled";
  }

  /**
   * 개인 권한 검사 — 교회 단위 스코프.
   * - 기본(deny-list): denied 행이 있을 때만 차단
   * - defaultDeny(allow-list): allowed 행이 있어야 허용 — 민감 권한용
   * - 행 우선순위: 해당 교회 행 > 글로벌(churchId NULL) 행 > 기본값
   *   (한 사람이 여러 교회 관리자여도 권한이 교회를 넘어 번지지 않음)
   */
  async check(
    userId: number,
    permKey: string,
    opts: { defaultDeny?: boolean; churchId?: number | null } = {}
  ): Promise<boolean> {
    const rows = await this.permissionRepo.find({
      where: { adminId: userId, permKey },
    });
    const scoped =
      opts.churchId != null ? rows.find((r) => r.churchId === opts.churchId) : undefined;
    const global = rows.find((r) => r.churchId === null);
    const permission = scoped ?? global;
    if (permission) return permission.status === "allowed";
    return !opts.defaultDeny;
  }

  /** super_admin은 항상 통과하는 편의 래퍼 */
  async checkForUser(
    user: { id: number; role: string },
    permKey: string,
    opts: { defaultDeny?: boolean; churchId?: number | null } = {}
  ): Promise<boolean> {
    if (user.role === "super_admin") return true;
    return this.check(user.id, permKey, opts);
  }
}
