import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import type { Request } from "express";

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: any }>();
    const user = request.user;

    if (!user) throw new UnauthorizedException("로그인이 필요합니다");
    if (user.role !== "super_admin") throw new ForbiddenException("최고관리자 권한이 필요합니다");

    return true;
  }
}
