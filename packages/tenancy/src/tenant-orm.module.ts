import { DynamicModule, Module, Scope } from "@nestjs/common";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, EntityTarget, ObjectLiteral } from "typeorm";
import { TENANT_DATASOURCE } from "./tenancy.constants";

/**
 * TypeOrmModule.forFeature의 테넌트 버전.
 *
 * 같은 getRepositoryToken을 사용하므로 서비스의 @InjectRepository(...) 코드는
 * 그대로 두고, 모듈에서 `TypeOrmModule.forFeature([...])`를
 * `TenantOrmModule.forFeature([...])`로 바꾸기만 하면
 * 리포지토리가 요청별 교회 DB를 바라봅니다.
 */
@Module({})
export class TenantOrmModule {
  static forFeature(entities: EntityTarget<ObjectLiteral>[]): DynamicModule {
    const providers = entities.map((entity) => ({
      provide: getRepositoryToken(entity as never),
      scope: Scope.REQUEST,
      inject: [TENANT_DATASOURCE] as never[],
      useFactory: (dataSource: DataSource) => dataSource.getRepository(entity),
    }));

    return {
      module: TenantOrmModule,
      providers,
      exports: providers.map((p) => p.provide),
    };
  }
}
