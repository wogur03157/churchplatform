import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestModule,
  Scope,
} from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import type { Request } from "express";
import { Church } from "@platform/entities";
import { TENANCY_MODULE_OPTIONS, TENANT_DATASOURCE } from "./tenancy.constants";
import type { TenancyModuleOptions } from "./tenancy.options";
import { TenancyService } from "./tenancy.service";
import { TenantProvisioningService } from "./tenant-provisioning.service";
import { TenantResolverMiddleware } from "./tenant-resolver.middleware";

/**
 * 테넌시 전역 모듈. 각 앱이 자기 테넌트 엔티티 목록으로 forRoot() 호출:
 *
 *   TenancyModule.forRoot({ tenantEntities: [...], seedTenant })
 *
 * - TenantResolverMiddleware: 모든 라우트에서 req.church 주입
 * - TENANT_DATASOURCE: 요청 스코프 — 요청이 속한 교회의 DataSource
 *   (프로비저닝 전 교회·미식별 요청은 중앙 DB 폴백)
 * - 도메인 모듈은 TenantOrmModule.forFeature()로 리포지토리 주입
 */
@Module({})
export class TenancyModule implements NestModule {
  static forRoot(options: TenancyModuleOptions): DynamicModule {
    return {
      module: TenancyModule,
      global: true,
      imports: [TypeOrmModule.forFeature([Church])],
      providers: [
        { provide: TENANCY_MODULE_OPTIONS, useValue: options },
        TenancyService,
        TenantProvisioningService,
        TenantResolverMiddleware,
        {
          provide: TENANT_DATASOURCE,
          scope: Scope.REQUEST,
          inject: [REQUEST, TenancyService],
          useFactory: (req: Request, tenancy: TenancyService) =>
            tenancy.getDataSourceFor(req.church),
        },
      ],
      exports: [TenancyService, TenantProvisioningService, TENANT_DATASOURCE],
    };
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantResolverMiddleware).forRoutes("*");
  }
}
