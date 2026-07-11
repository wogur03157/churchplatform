import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PageGroup } from "./entities/page-group.entity";

type PageGroupSeed = Pick<
  PageGroup,
  "groupKey" | "name" | "slug" | "description" | "content" | "imageUrl" | "displayOrder" | "status"
>;

function buildContent(summary: string, highlights: string[]) {
  return `
    <p>${summary}</p>
    <ul>
      ${highlights.map((item) => `<li>${item}</li>`).join("")}
    </ul>
  `;
}

function createPageGroupSeed(
  groupKey: PageGroup["groupKey"],
  name: string,
  slug: string,
  description: string,
  displayOrder: number,
  highlights: string[]
): PageGroupSeed {
  return {
    groupKey,
    name,
    slug,
    description,
    content: buildContent(description, highlights),
    imageUrl: null,
    displayOrder,
    status: "visible",
  };
}

const DEFAULT_PAGE_GROUPS: PageGroupSeed[] = [
  createPageGroupSeed("departments", "영아부", "infant", "영아부 소개 페이지입니다.", 10, [
    "0세부터 영아 시기 아이들과 부모가 함께 예배하는 부서입니다.",
    "가정과 교회가 함께 다음 세대의 신앙 기초를 세워갑니다.",
  ]),
  createPageGroupSeed("departments", "유아부", "toddler", "유아부 소개 페이지입니다.", 20, [
    "유아기의 눈높이에 맞춘 찬양과 말씀 교육을 진행합니다.",
    "보호자와 함께 신앙의 첫걸음을 시작하도록 돕습니다.",
  ]),
  createPageGroupSeed("departments", "유치부", "kindergarten", "유치부 소개 페이지입니다.", 30, [
    "예배와 활동을 통해 하나님을 기쁘게 알아가도록 돕습니다.",
    "주일 예배와 절기 프로그램이 함께 운영됩니다.",
  ]),
  createPageGroupSeed("departments", "초등부", "elementary", "초등부 소개 페이지입니다.", 40, [
    "초등학생들이 말씀과 공동체를 경험하도록 돕는 부서입니다.",
    "성경공부와 예배, 다양한 공동체 활동을 진행합니다.",
  ]),
  createPageGroupSeed("departments", "청소년부", "youth", "청소년부 소개 페이지입니다.", 50, [
    "중고등학생이 예배와 말씀 안에서 신앙 정체성을 세워갑니다.",
    "또래 공동체와 함께 기도와 나눔의 시간을 가집니다.",
  ]),
  createPageGroupSeed("departments", "청년부", "young-adult", "청년부 소개 페이지입니다.", 60, [
    "20~30대 청년들이 예배와 교제, 훈련으로 함께 성장합니다.",
    "직장과 학업의 자리에서 믿음을 살아내도록 돕습니다.",
  ]),
  createPageGroupSeed("god-love", "새벽기도회", "dawn-prayer", "새벽기도회 안내입니다.", 10, [
    "매일 새벽 말씀과 기도로 하루를 시작합니다.",
    "개인과 가정, 교회와 나라를 위해 함께 기도합니다.",
  ]),
  createPageGroupSeed("god-love", "성경공부", "bible-study", "성경공부 안내입니다.", 20, [
    "성경의 흐름과 핵심 진리를 체계적으로 배우는 과정입니다.",
    "신청 일정과 반 편성은 교회 공지를 통해 안내됩니다.",
  ]),
  createPageGroupSeed("god-love", "구역예배", "district-worship", "구역예배 안내입니다.", 30, [
    "생활권 중심의 소그룹 예배로 삶 속에서 말씀을 나눕니다.",
    "구역별 일정은 담당 리더를 통해 안내받을 수 있습니다.",
  ]),
  createPageGroupSeed("neighbor-love", "지역사회봉사", "community-service", "지역사회봉사 안내입니다.", 10, [
    "지역사회 이웃을 섬기는 다양한 봉사 사역을 진행합니다.",
    "정기 봉사 일정은 교회 일정표와 공지에서 확인할 수 있습니다.",
  ]),
  createPageGroupSeed("neighbor-love", "푸드뱅크", "food-bank", "푸드뱅크 안내입니다.", 20, [
    "식료품 나눔을 통해 도움이 필요한 이웃을 섬깁니다.",
    "후원과 자원봉사는 교회 사무실을 통해 신청할 수 있습니다.",
  ]),
];

@Injectable()
export class PageGroupsService implements OnModuleInit {
  constructor(@InjectRepository(PageGroup) private readonly repo: Repository<PageGroup>) {}

  async onModuleInit() {
    await this.ensureDefaults();
  }

  findAll(groupKey?: string): Promise<PageGroup[]> {
    const where = groupKey ? { groupKey } : {};
    return this.repo.find({ where, order: { displayOrder: "ASC" } });
  }

  findOne(id: number): Promise<PageGroup | null> {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<PageGroup>): Promise<PageGroup> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<PageGroup>): Promise<void> {
    await this.repo.update(id, data);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  private async ensureDefaults() {
    for (const seed of DEFAULT_PAGE_GROUPS) {
      const existing = await this.repo.findOne({
        where: { groupKey: seed.groupKey, slug: seed.slug },
      });

      if (existing) {
        let changed = false;
        if (existing.name !== seed.name) {
          existing.name = seed.name;
          changed = true;
        }
        if (existing.description !== seed.description) {
          existing.description = seed.description;
          changed = true;
        }
        if (!existing.content?.trim()) {
          existing.content = seed.content;
          changed = true;
        }
        if (existing.displayOrder !== seed.displayOrder) {
          existing.displayOrder = seed.displayOrder;
          changed = true;
        }
        if (existing.status !== seed.status) {
          existing.status = seed.status;
          changed = true;
        }
        if (changed) {
          await this.repo.save(existing);
        }
        continue;
      }

      await this.repo.save(this.repo.create(seed));
    }
  }
}
