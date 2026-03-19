import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SiteConfig } from "./entities/site-config.entity";

@Injectable()
export class SiteConfigService {
  constructor(@InjectRepository(SiteConfig) private readonly repo: Repository<SiteConfig>) {}

  findAll(): Promise<SiteConfig[]> { return this.repo.find(); }
  findByKey(key: string): Promise<SiteConfig | null> { return this.repo.findOne({ where: { key } }); }
  async upsert(key: string, value: string): Promise<SiteConfig> {
    // MySQL에서 NULL 컬럼이 포함된 UNIQUE 제약은 충돌 감지 불가 → find+save 패턴 사용
    let record = await this.repo.findOne({ where: { key, churchId: null as any } });
    if (record) {
      record.value = value;
    } else {
      record = this.repo.create({ key, value, churchId: null });
    }
    return this.repo.save(record);
  }
}
