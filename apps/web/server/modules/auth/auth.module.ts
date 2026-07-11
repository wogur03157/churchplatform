import { Module } from "@nestjs/common";
import { PlatformAuthModule } from "@platform/auth";
import { AuthController } from "./auth.controller";

/**
 * web 앱 인증 모듈 — 공통 인증(@platform/auth) + 로그인/로그아웃 HTTP 엔드포인트.
 * AuthService/가드 구현은 packages/auth에 있다.
 */
@Module({
  imports: [PlatformAuthModule],
  controllers: [AuthController],
  exports: [PlatformAuthModule],
})
export class AuthModule {}
