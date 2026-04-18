import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SiteConfig } from "./entities/site-config.entity";

@Injectable()
export class SiteConfigService {
  constructor(@InjectRepository(SiteConfig) private readonly repo: Repository<SiteConfig>) {}

  // 현재는 단일 교회 시스템이므로 churchId 1을 기본으로 처리
  async findAll(): Promise<SiteConfig[]> { 
    return this.repo.find({ 
      where: [
        { churchId: 1 },
        { churchId: null as any }
      ],
      order: { churchId: "DESC" } // churchId 1인 것을 우선순위로
    }); 
  }

  findByKey(key: string): Promise<SiteConfig | null> { 
    return this.repo.findOne({ where: { key, churchId: 1 } }); 
  }

  async upsert(key: string, value: string): Promise<SiteConfig> {
    let record = await this.repo.findOne({ where: { key, churchId: 1 } });
    if (record) {
      record.value = value;
    } else {
      record = this.repo.create({ key, value, churchId: 1 });
    }
    return this.repo.save(record);
  }
}
