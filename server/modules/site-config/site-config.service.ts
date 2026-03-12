import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SiteConfig } from "./entities/site-config.entity";

@Injectable()
export class SiteConfigService {
  constructor(@InjectRepository(SiteConfig) private readonly repo: Repository<SiteConfig>) {}

  findAll(): Promise<SiteConfig[]> { return this.repo.find(); }
  findByKey(key: string): Promise<SiteConfig | null> { return this.repo.findOne({ where: { key } }); }
  async upsert(key: string, value: string): Promise<void> {
    await this.repo.upsert({ key, value }, { conflictPaths: ["churchId", "key"] });
  }
}
