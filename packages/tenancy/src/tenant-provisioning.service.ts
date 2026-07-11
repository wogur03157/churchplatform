import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Church } from "@platform/entities";
import { TENANCY_MODULE_OPTIONS } from "./tenancy.constants";
import type { TenancyModuleOptions } from "./tenancy.options";
import { tenantDataSourceOptions, tenantDbNameFromSlug } from "./tenant-db.util";
import { TenancyService } from "./tenancy.service";

/**
 * 교회 승인 시 테넌트 DB를 생성하고 스키마·기본 데이터를 세팅합니다.
 * 동기화 대상 엔티티와 시드는 TenancyModule.forRoot() 옵션에서 옵니다.
 * (주의: 이 앱이 아는 엔티티만 동기화됨 — 전 앱 일괄 반영은 scripts/tenants.ts)
 */
@Injectable()
export class TenantProvisioningService {
  private readonly logger = new Logger(TenantProvisioningService.name);

  constructor(
    @InjectDataSource()
    private readonly platformDataSource: DataSource,
    @InjectRepository(Church)
    private readonly churchRepo: Repository<Church>,
    @Inject(TenancyService)
    private readonly tenancy: TenancyService,
    @Inject(TENANCY_MODULE_OPTIONS)
    private readonly options: TenancyModuleOptions
  ) {}

  /**
   * 교회 하나를 프로비저닝: DB 생성 → 테이블 동기화 → 기본 데이터 시드 → dbName 저장.
   * 이미 프로비저닝된 교회에 다시 실행해도 안전합니다(멱등).
   */
  async provision(church: Church): Promise<Church> {
    const dbName = church.dbName ?? tenantDbNameFromSlug(church.slug);

    await this.createDatabaseIfNotExists(dbName);
    await this.syncTenantSchema(dbName);

    if (church.dbName !== dbName) {
      church.dbName = dbName;
      await this.churchRepo.save(church);
      this.tenancy.invalidateChurchCache();
    }

    this.logger.log(`Tenant provisioned: ${church.slug} → ${dbName}`);
    return church;
  }

  private async createDatabaseIfNotExists(dbName: string): Promise<void> {
    // dbName은 tenantDbNameFromSlug로 정규화되어 영숫자/언더스코어만 포함
    await this.platformDataSource.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  }

  /**
   * 테넌트 DB에 엔티티 기준으로 테이블 생성/갱신.
   * 새 DB에는 전체 테이블을 만들고, 기존 DB에는 누락분만 추가합니다.
   */
  async syncTenantSchema(dbName: string): Promise<void> {
    const dataSource = new DataSource(
      tenantDataSourceOptions(dbName, this.options.tenantEntities)
    );
    await dataSource.initialize();
    try {
      await dataSource.synchronize();
      if (this.options.seedTenant) await this.options.seedTenant(dataSource);
    } finally {
      await dataSource.destroy();
    }
  }
}
