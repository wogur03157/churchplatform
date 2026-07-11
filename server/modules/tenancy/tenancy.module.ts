import { Global, MiddlewareConsumer, Module, NestModule, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import type { Request } from "express";
import { Church } from "../churches/entities/church.entity";
import { TENANT_DATASOURCE } from "./tenancy.constants";
import { TenancyService } from "./tenancy.service";
import { TenantProvisioningService } from "./tenant-provisioning.service";
import { TenantResolverMiddleware } from "./tenant-resolver.middleware";

/**
 * 테넌시 전역 모듈.
 *
 * - TenantResolverMiddleware를 모든 라우트에 적용해 req.church를 채웁니다.
 * - TENANT_DATASOURCE: 요청 스코프 프로바이더. 요청이 속한 교회의 DataSource
 *   (프로비저닝 전이면 중앙 DB)를 제공합니다.
 * - 각 도메인 모듈은 TenantOrmModule.forFeature()로 이 DataSource 기반
 *   리포지토리를 주입받습니다.
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Church])],
  providers: [
    TenancyService,
    TenantProvisioningService,
    {
      provide: TENANT_DATASOURCE,
      scope: Scope.REQUEST,
      inject: [REQUEST, TenancyService],
      useFactory: (req: Request, tenancy: TenancyService) =>
        tenancy.getDataSourceFor(req.church),
    },
  ],
  exports: [TenancyService, TenantProvisioningService, TENANT_DATASOURCE],
})
export class TenancyModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantResolverMiddleware).forRoutes("*");
  }
}
