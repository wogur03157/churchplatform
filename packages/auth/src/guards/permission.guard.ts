import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from "@platform/shared";
import { AdminPermission, ChurchFeature } from "@platform/entities";
import { AuthService } from "../auth.service";

export const PERM_KEY_METADATA = "platform:permKey";

/**
 * 컨트롤러/핸들러에 필요한 권한 키를 지정한다.
 *   @UseGuards(PermissionGuard) @RequirePermission("members")
 *
 * permKey 규칙: `<featureKey>` 또는 `<featureKey>_<세부권한>`
 * (예: members, members_sensitive, finance_approve)
 */
export const RequirePermission = (permKey: string) =>
  SetMetadata(PERM_KEY_METADATA, permKey);

/**
 * 테넌트 앱(재적·재정)용 권한 가드. 검사 순서:
 *
 *  1. 로그인 + 관리자 역할 (church_admin | super_admin)
 *  2. 교회 컨텍스트 필수 — req.church 없으면 거부 (테넌트 데이터 보호)
 *  3. church_admin이면: 해당 교회 소속 여부
 *  4. 교회 기능 플래그: church_features[featureKey]가 disabled면 거부
 *     (행이 없으면 허용 — 기존 교회 하위호환)
 *  5. 개인 권한: admin_permissions[adminId, permKey]가 denied면 거부
 *     (행이 없으면 허용)
 *
 *  super_admin은 3~5를 건너뛴다.
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
    @Inject(Reflector)
    private readonly reflector: Reflector,
    @InjectRepository(AdminPermission)
    private readonly permissionRepo: Repository<AdminPermission>,
    @InjectRepository(ChurchFeature)
    private readonly featureRepo: Repository<ChurchFeature>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = await this.authService.authenticateRequest(request);
    if (!user) throw new UnauthorizedException(UNAUTHED_ERR_MSG);
    if (user.role !== "church_admin" && user.role !== "super_admin") {
      throw new ForbiddenException(NOT_ADMIN_ERR_MSG);
    }
    request.user = user;

    const church = request.church;
    if (!church) {
      throw new ForbiddenException("교회를 식별할 수 없습니다");
    }

    if (user.role === "super_admin") return true;

    const isMember = await this.authService.isChurchAdminOf(church.id, user.id);
    if (!isMember) throw new ForbiddenException(NOT_ADMIN_ERR_MSG);

    const permKey = this.reflector.getAllAndOverride<string | undefined>(
      PERM_KEY_METADATA,
      [context.getHandler(), context.getClass()]
    );
    if (!permKey) return true;

    const featureKey = permKey.split("_")[0];
    const feature = await this.featureRepo.findOne({
      where: { churchId: church.id, featureKey: featureKey as never },
    });
    if (feature && feature.status === "disabled") {
      throw new ForbiddenException("교회에서 비활성화된 기능입니다");
    }

    const permission = await this.permissionRepo.findOne({
      where: { adminId: user.id, permKey },
    });
    if (permission && permission.status === "denied") {
      throw new ForbiddenException(NOT_ADMIN_ERR_MSG);
    }

    return true;
  }
}
