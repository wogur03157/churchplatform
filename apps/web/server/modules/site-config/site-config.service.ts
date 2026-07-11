import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SiteConfig } from "./entities/site-config.entity";

@Injectable()
export class SiteConfigService {
  constructor(@InjectRepository(SiteConfig) private readonly repo: Repository<SiteConfig>) {}

  // 리포지토리가 이미 교회별 DB를 바라보므로 key 단위로만 조회
  // (churchId DESC: 단일 DB 시절 churchId=1 행과 NULL 행이 공존하면 전자를 우선)
  async findAll(): Promise<SiteConfig[]> {
    return this.repo.find({ order: { key: "ASC", churchId: "DESC" } });
  }

  findByKey(key: string): Promise<SiteConfig | null> {
    return this.repo.findOne({ where: { key }, order: { churchId: "DESC" } });
  }

  async upsert(key: string, value: string): Promise<SiteConfig> {
    let record = await this.repo.findOne({ where: { key } });
    if (record) {
      record.value = value;
    } else {
      record = this.repo.create({ key, value });
    }
    return this.repo.save(record);
  }
}
