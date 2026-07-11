import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminPermission, Church, ChurchAdmin, ChurchFeature, User } from "@platform/entities";
import { AuthService } from "./auth.service";
import { AdminGuard } from "./guards/admin.guard";
import { OptionalAuthGuard } from "./guards/optional-auth.guard";
import { PermissionGuard } from "./guards/permission.guard";

/**
 * 플랫폼 공통 인증 모듈 (컨트롤러 없음).
 *
 * 모든 앱(web/members/finance)이 같은 JWT 쿠키를 검증하도록 이 모듈을 import.
 * 로그인/로그아웃 HTTP 엔드포인트는 web 앱의 AuthModule에만 있다.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User, ChurchAdmin, Church, ChurchFeature, AdminPermission]),
  ],
  providers: [AuthService, OptionalAuthGuard, AdminGuard, PermissionGuard],
  exports: [AuthService, OptionalAuthGuard, AdminGuard, PermissionGuard, TypeOrmModule],
})
export class PlatformAuthModule {}
