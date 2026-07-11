import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { UNAUTHED_ERR_MSG, NOT_ADMIN_ERR_MSG } from "@shared/const";
import { AuthService } from "../auth.service";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = await this.authService.authenticateRequest(request);
    if (!user) {
      throw new UnauthorizedException(UNAUTHED_ERR_MSG);
    }

    if (user.role !== "church_admin" && user.role !== "super_admin") {
      throw new ForbiddenException(NOT_ADMIN_ERR_MSG);
    }

    // 교회 컨텍스트가 있는 요청이면, church_admin은 해당 교회 소속이어야 함
    // (super_admin은 모든 교회 접근 가능. req.church가 없으면 단일 교회 배포 호환을 위해 역할 검사만 수행)
    if (user.role === "church_admin" && request.church) {
      const isMember = await this.authService.isChurchAdminOf(request.church.id, user.id);
      if (!isMember) {
        throw new ForbiddenException(NOT_ADMIN_ERR_MSG);
      }
    }

    request.user = user;
    return true;
  }
}
