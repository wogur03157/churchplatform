import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Church } from "../churches/entities/church.entity";
import { tenantDataSourceOptions } from "./tenant-db.util";

interface CachedTenant {
  dataSource: DataSource;
  lastUsedAt: number;
}

/**
 * 교회별(테넌트) DataSource 관리.
 *
 * - DATABASE_URL(중앙 DB)과 같은 MySQL 서버에서 database 이름만 바꿔 접속합니다.
 * - DataSource는 교회 단위로 캐시하고, 캐시 상한을 넘으면 가장 오래 안 쓴 것부터 정리합니다.
 * - 교회 식별(slug → Church)도 짧은 TTL로 캐시해 요청마다 중앙 DB를 조회하지 않습니다.
 */
@Injectable()
export class TenancyService implements OnModuleDestroy {
  private readonly logger = new Logger(TenancyService.name);

  private readonly dataSources = new Map<number, Promise<CachedTenant>>();
  private readonly maxCachedTenants = parseInt(process.env.TENANT_DS_CACHE_MAX || "20");
  private readonly poolSize = parseInt(process.env.TENANT_DB_POOL_SIZE || "3");

  private readonly churchCache = new Map<string, { church: Church | null; expiresAt: number }>();
  private static readonly CHURCH_CACHE_TTL_MS = 60_000;

  constructor(
    @InjectDataSource()
    private readonly platformDataSource: DataSource
  ) {}

  // ── 교회 식별 ───────────────────────────────────────────────────────────

  /** slug로 active 교회 조회 (60초 캐시) */
  async findChurchBySlug(slug: string): Promise<Church | null> {
    return this.cachedChurchLookup(`slug:${slug}`, (repo) =>
      repo.findOne({ where: { slug, status: "active" } })
    );
  }

  /** 커스텀 도메인으로 active 교회 조회 (60초 캐시) */
  async findChurchByDomain(host: string): Promise<Church | null> {
    return this.cachedChurchLookup(`domain:${host}`, (repo) =>
      repo.findOne({ where: { customDomain: host, status: "active" } })
    );
  }

  private async cachedChurchLookup(
    cacheKey: string,
    query: (repo: Repository<Church>) => Promise<Church | null>
  ): Promise<Church | null> {
    const cached = this.churchCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.church;

    const church = await query(this.platformDataSource.getRepository(Church));
    this.churchCache.set(cacheKey, {
      church,
      expiresAt: Date.now() + TenancyService.CHURCH_CACHE_TTL_MS,
    });
    return church;
  }

  /** 교회 정보 변경(승인/도메인 변경 등) 시 식별 캐시 무효화 */
  invalidateChurchCache(): void {
    this.churchCache.clear();
  }

  // ── DataSource 라우팅 ───────────────────────────────────────────────────

  /**
   * 요청이 속한 교회의 DataSource 반환.
   * dbName이 없는 교회(아직 프로비저닝 전)는 중앙 DB를 그대로 사용합니다(단일 DB 하위호환).
   */
  async getDataSourceFor(church: Church | null | undefined): Promise<DataSource> {
    if (!church?.dbName) return this.platformDataSource;
    const cached = await this.getOrCreateTenant(church.id, church.dbName);
    cached.lastUsedAt = Date.now();
    return cached.dataSource;
  }

  private getOrCreateTenant(churchId: number, dbName: string): Promise<CachedTenant> {
    let entry = this.dataSources.get(churchId);
    if (!entry) {
      entry = this.createTenantDataSource(dbName).then((dataSource) => ({
        dataSource,
        lastUsedAt: Date.now(),
      }));
      // 초기화 실패 시 캐시에 실패한 Promise가 남지 않도록 제거
      entry.catch(() => this.dataSources.delete(churchId));
      this.dataSources.set(churchId, entry);
      void this.evictIfNeeded();
    }
    return entry;
  }

  private async createTenantDataSource(dbName: string): Promise<DataSource> {
    const dataSource = new DataSource(
      tenantDataSourceOptions(dbName, {
        logging: process.env.NODE_ENV === "development",
        extra: { connectionLimit: this.poolSize },
      } as never)
    );
    await dataSource.initialize();
    this.logger.log(`Tenant DataSource initialized: ${dbName}`);
    return dataSource;
  }

  private async evictIfNeeded(): Promise<void> {
    if (this.dataSources.size <= this.maxCachedTenants) return;

    const entries = await Promise.all(
      Array.from(this.dataSources.entries()).map(async ([id, promise]) => ({
        id,
        cached: await promise.catch(() => null),
      }))
    );
    const alive = entries.filter((e) => e.cached !== null) as {
      id: number;
      cached: CachedTenant;
    }[];
    alive.sort((a, b) => a.cached.lastUsedAt - b.cached.lastUsedAt);

    while (alive.length > this.maxCachedTenants) {
      const oldest = alive.shift()!;
      this.dataSources.delete(oldest.id);
      await oldest.cached.dataSource.destroy().catch((err) => {
        this.logger.warn(`Failed to destroy tenant DataSource #${oldest.id}: ${err}`);
      });
      this.logger.log(`Evicted tenant DataSource #${oldest.id}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    for (const promise of Array.from(this.dataSources.values())) {
      const cached = await promise.catch(() => null);
      if (cached) await cached.dataSource.destroy().catch(() => undefined);
    }
    this.dataSources.clear();
  }
}
