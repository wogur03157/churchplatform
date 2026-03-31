import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { ContentCategory } from "./entities/content-category.entity";
import {
  ContentPage,
  type ContentTemplateCode,
} from "./entities/content-page.entity";
import { ContentPageMedia } from "./entities/content-page-media.entity";

type CategoryInput = {
  parentId?: number | null;
  name: string;
  slug: string;
  sortOrder?: number;
  status?: "active" | "hidden";
  templateCode?: ContentTemplateCode;
};

type PageUpdateInput = {
  title?: string;
  content?: string | null;
  templateCode?: ContentTemplateCode;
  status?: "published" | "draft";
  media?: Array<{
    slotKey: string;
    mediaType: "image" | "video";
    url: string;
    thumbnailUrl?: string | null;
    altText?: string | null;
    sortOrder?: number;
  }>;
};

type CategoryTreeNode = ContentCategory & {
  page: ContentPage | null;
  children: CategoryTreeNode[];
};

const EXCLUDED_ROOT_SLUGS = new Set(["media"]);

type CategorySeedNode = {
  slug: string;
  name: string;
  sortOrder: number;
  templateCode?: ContentTemplateCode;
  children?: CategorySeedNode[];
};

const DEFAULT_CATEGORY_TREE: CategorySeedNode[] = [
  {
    slug: "church",
    name: "교회소개",
    sortOrder: 10,
    children: [
      { slug: "about", name: "영신교회", sortOrder: 10 },
      { slug: "worship", name: "예배안내", sortOrder: 20 },
      { slug: "directions", name: "오시는길", sortOrder: 30 },
    ],
  },
  {
    slug: "sermons",
    name: "설교",
    sortOrder: 20,
    children: [
      { slug: "sunday", name: "주일설교", sortOrder: 10 },
      { slug: "midweek", name: "수요/금요 설교", sortOrder: 20 },
      { slug: "special", name: "특별설교", sortOrder: 30 },
    ],
  },
  {
    slug: "community",
    name: "공동체",
    sortOrder: 30,
    children: [
      {
        slug: "departments",
        name: "부서소개",
        sortOrder: 10,
        children: [
          { slug: "infant", name: "영아부", sortOrder: 10 },
          { slug: "toddler", name: "유아부", sortOrder: 20 },
          { slug: "kindergarten", name: "유치부", sortOrder: 30 },
          { slug: "elementary", name: "초등부", sortOrder: 40 },
          { slug: "youth", name: "청소년부", sortOrder: 50 },
          { slug: "young-adult", name: "청년부", sortOrder: 60 },
        ],
      },
      { slug: "small-church", name: "작은교회", sortOrder: 20 },
      { slug: "new-member", name: "새가족 안내", sortOrder: 30 },
    ],
  },
  {
    slug: "ministry",
    name: "사역과양육",
    sortOrder: 40,
    children: [
      {
        slug: "god-love",
        name: "하나님사랑",
        sortOrder: 10,
        children: [
          { slug: "dawn-prayer", name: "새벽기도회", sortOrder: 10 },
          { slug: "bible-study", name: "성경공부", sortOrder: 20 },
          { slug: "district-worship", name: "구역예배", sortOrder: 30 },
        ],
      },
      {
        slug: "neighbor-love",
        name: "이웃사랑",
        sortOrder: 20,
        children: [
          { slug: "community-service", name: "지역사회봉사", sortOrder: 10 },
          { slug: "food-bank", name: "푸드뱅크", sortOrder: 20 },
        ],
      },
    ],
  },
  {
    slug: "news",
    name: "교회소식",
    sortOrder: 50,
    children: [
      { slug: "announcements", name: "공지사항", sortOrder: 10 },
      { slug: "ministry-board", name: "사역게시판", sortOrder: 20 },
    ],
  },
];

const DEFAULT_PAGE_CONTENTS: Record<string, { title: string; content: string }> = {
  "church/about": {
    title: "영신교회 소개",
    content: `
      <p class="text-lg text-muted-foreground">하나님의 사랑으로 세워진 공동체</p>
      <section class="mt-10">
        <h2>교회 소개</h2>
        <p>영신교회는 서울 양천구 목동에 위치한 교회로, 하나님의 말씀을 중심으로 성장하는 공동체입니다. 우리 교회는 예배, 교육, 봉사, 교제를 통해 하나님의 나라를 이 땅에 세워가고 있습니다.</p>
      </section>
      <section class="mt-10">
        <h2>교회 비전</h2>
        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-xl border bg-muted/30 p-6">
            <h3 class="mt-0">하나님 사랑</h3>
            <p class="mb-0">진정한 예배와 말씀 묵상을 통해 하나님과 깊은 관계를 맺는 공동체</p>
          </div>
          <div class="rounded-xl border bg-muted/30 p-6">
            <h3 class="mt-0">이웃 사랑</h3>
            <p class="mb-0">지역사회와 세상을 향해 그리스도의 사랑을 실천하는 공동체</p>
          </div>
          <div class="rounded-xl border bg-muted/30 p-6">
            <h3 class="mt-0">함께 성장</h3>
            <p class="mb-0">신앙의 여정을 함께 걸어가며 서로를 세워가는 공동체</p>
          </div>
        </div>
      </section>
      <section class="mt-10">
        <h2>교회 역사</h2>
        <div class="space-y-3 border-l-2 border-primary/30 pl-6">
          <div><strong>1990</strong> 영신교회 창립</div>
          <div><strong>2000</strong> 성전 건축 및 이전</div>
          <div><strong>2010</strong> 선교 비전 선포</div>
          <div><strong>2020</strong> 온라인 사역 확장</div>
          <div><strong>2026</strong> 지역사회 섬김 강화</div>
        </div>
      </section>
      <section class="mt-10">
        <h2>담임목사</h2>
        <div class="flex items-start gap-6 rounded-xl border p-6">
          <div class="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground">목</div>
          <div>
            <h3 class="mt-0">담임목사</h3>
            <p class="mb-0">영신교회를 이끌며 하나님의 말씀을 선포하고 성도들을 섬기고 있습니다.</p>
          </div>
        </div>
      </section>
    `,
  },
  "church/worship": {
    title: "예배 안내",
    content: `
      <p class="text-lg text-muted-foreground">영신교회의 예배 시간을 안내해 드립니다</p>
      <section class="mt-10">
        <h2>주일예배</h2>
        <div class="overflow-hidden rounded-xl border">
          <table class="w-full text-sm">
            <thead class="bg-muted/50">
              <tr>
                <th class="px-4 py-3 text-left">예배명</th>
                <th class="px-4 py-3 text-left">시간</th>
                <th class="px-4 py-3 text-left">장소</th>
                <th class="px-4 py-3 text-left">비고</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="px-4 py-3">1부 예배</td><td class="px-4 py-3">오전 09:00</td><td class="px-4 py-3">본당</td><td class="px-4 py-3">전 연령</td></tr>
              <tr><td class="px-4 py-3">2부 예배</td><td class="px-4 py-3">오전 11:00</td><td class="px-4 py-3">본당</td><td class="px-4 py-3">전 연령</td></tr>
              <tr><td class="px-4 py-3">유·아동부</td><td class="px-4 py-3">오전 11:00</td><td class="px-4 py-3">교육관 1층</td><td class="px-4 py-3">0세~초등</td></tr>
              <tr><td class="px-4 py-3">청소년부</td><td class="px-4 py-3">오전 11:00</td><td class="px-4 py-3">교육관 2층</td><td class="px-4 py-3">중·고등학생</td></tr>
              <tr><td class="px-4 py-3">청년부</td><td class="px-4 py-3">오후 02:00</td><td class="px-4 py-3">본당</td><td class="px-4 py-3">20~30대</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <section class="mt-10">
        <h2>주중예배</h2>
        <div class="overflow-hidden rounded-xl border">
          <table class="w-full text-sm">
            <thead class="bg-muted/50">
              <tr>
                <th class="px-4 py-3 text-left">예배명</th>
                <th class="px-4 py-3 text-left">시간</th>
                <th class="px-4 py-3 text-left">장소</th>
                <th class="px-4 py-3 text-left">비고</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="px-4 py-3">새벽기도회</td><td class="px-4 py-3">매일 05:30</td><td class="px-4 py-3">본당</td><td class="px-4 py-3"></td></tr>
              <tr><td class="px-4 py-3">수요예배</td><td class="px-4 py-3">수요일 19:30</td><td class="px-4 py-3">본당</td><td class="px-4 py-3"></td></tr>
              <tr><td class="px-4 py-3">금요기도회</td><td class="px-4 py-3">금요일 19:30</td><td class="px-4 py-3">본당</td><td class="px-4 py-3"></td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <section class="mt-10">
        <h2>소그룹</h2>
        <div class="overflow-hidden rounded-xl border">
          <table class="w-full text-sm">
            <thead class="bg-muted/50">
              <tr>
                <th class="px-4 py-3 text-left">모임명</th>
                <th class="px-4 py-3 text-left">시간</th>
                <th class="px-4 py-3 text-left">장소</th>
                <th class="px-4 py-3 text-left">비고</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="px-4 py-3">구역예배</td><td class="px-4 py-3">주중 (구역별)</td><td class="px-4 py-3">각 구역</td><td class="px-4 py-3">목자에게 문의</td></tr>
              <tr><td class="px-4 py-3">성경공부</td><td class="px-4 py-3">화요일 10:00</td><td class="px-4 py-3">교육관</td><td class="px-4 py-3">사전 등록</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <div class="mt-10 rounded-xl border border-primary/20 bg-primary/5 p-6 text-sm text-muted-foreground">
        예배 시간 및 장소는 교회 사정에 따라 변경될 수 있습니다. 최신 정보는 공지사항을 확인하세요.
      </div>
    `,
  },
  "church/directions": {
    title: "오시는 길",
    content: `
      <p class="text-lg text-muted-foreground">영신교회 위치를 안내해 드립니다</p>
      <section class="mt-10 rounded-xl border bg-muted/30 p-5">
        <h2 class="mt-0">교회 위치</h2>
        <p class="mb-2">서울특별시 양천구 목동로 19길 28</p>
        <p class="mb-0 text-sm text-muted-foreground">대중교통과 자가용으로 모두 접근하실 수 있습니다.</p>
      </section>
      <section class="mt-10">
        <h2>교통편</h2>
        <div class="grid gap-6 md:grid-cols-2">
          <div class="rounded-xl border p-5">
            <h3 class="mt-0">지하철</h3>
            <ul>
              <li>5호선 목동역 2번 출구 도보 10분</li>
              <li>2호선 합정역 환승 후 5호선 이용</li>
            </ul>
          </div>
          <div class="rounded-xl border p-5">
            <h3 class="mt-0">버스</h3>
            <ul>
              <li>목동로 정류장 하차</li>
              <li>6614, 6630, 양천01 이용</li>
            </ul>
          </div>
        </div>
      </section>
      <div class="mt-10 rounded-xl border bg-muted p-8 text-center text-muted-foreground">
        지도 임베드 URL은 사이트 설정의 지도 값과 함께 사용할 수 있습니다.
      </div>
    `,
  },
  "community/small-church": {
    title: "작은교회",
    content: `
      <p class="text-lg text-muted-foreground">가정 같은 따뜻한 공동체</p>
      <section class="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-8">
        <h2 class="mt-0">작은교회란?</h2>
        <p class="mb-0">작은교회는 5~12명이 모여 함께 예배하고, 말씀을 나누며, 서로의 삶을 돌보는 소그룹 공동체입니다. 큰 교회 안의 작은 교회로서 진정한 교제와 영적 성장을 이루어 나갑니다.</p>
      </section>
      <section class="mt-10">
        <h2>작은교회 활동</h2>
        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-xl border p-5 text-center"><h3 class="mt-0">말씀 나눔</h3><p class="mb-0">주일 설교 말씀을 함께 묵상하고 나눕니다.</p></div>
          <div class="rounded-xl border p-5 text-center"><h3 class="mt-0">기도 모임</h3><p class="mb-0">서로를 위해 함께 기도하며 중보합니다.</p></div>
          <div class="rounded-xl border p-5 text-center"><h3 class="mt-0">삶의 나눔</h3><p class="mb-0">일상의 기쁨과 어려움을 함께 나눕니다.</p></div>
        </div>
      </section>
      <section class="mt-10">
        <h2>참여 안내</h2>
        <ul>
          <li>작은교회는 지역별로 편성되어 있습니다.</li>
          <li>주중 저녁 또는 주말에 모입니다.</li>
          <li>참여를 원하시면 교회 사무실 또는 담당 목사님께 문의해 주세요.</li>
          <li>새가족은 새가족반 수료 후 배정됩니다.</li>
        </ul>
      </section>
    `,
  },
  "community/new-member": {
    title: "새가족 안내",
    content: `
      <p class="text-lg text-muted-foreground">영신교회에 오신 것을 환영합니다</p>
      <section class="mt-10">
        <h2>새가족 프로그램</h2>
        <div class="space-y-3">
          <div class="rounded-lg border p-4"><strong>01 새가족 환영</strong><p class="mb-0">주일 예배 후 담당 사역자와 개별 상담</p></div>
          <div class="rounded-lg border p-4"><strong>02 새가족반 수강</strong><p class="mb-0">4주 과정으로 교회와 신앙을 배웁니다</p></div>
          <div class="rounded-lg border p-4"><strong>03 작은교회 배정</strong><p class="mb-0">지역과 상황에 맞는 소그룹에 합류합니다</p></div>
          <div class="rounded-lg border p-4"><strong>04 세례/입교</strong><p class="mb-0">세례 및 입교 교육 후 정식 교인 등록</p></div>
        </div>
      </section>
      <section class="mt-10">
        <h2>신청 안내</h2>
        <p>새가족 신청 폼은 관리자에서 설정한 항목을 기준으로 아래에서 입력할 수 있습니다.</p>
      </section>
    `,
  },
};

@Injectable()
export class ContentPagesService implements OnModuleInit {
  constructor(
    @InjectRepository(ContentCategory)
    private readonly categoryRepo: Repository<ContentCategory>,
    @InjectRepository(ContentPage)
    private readonly pageRepo: Repository<ContentPage>,
    @InjectRepository(ContentPageMedia)
    private readonly mediaRepo: Repository<ContentPageMedia>
  ) {}

  async onModuleInit() {
    await this.ensureDefaultCategories();
    await this.ensureDefaultPageContents();
  }

  async findCategories(rootSlug?: string) {
    const categories = await this.categoryRepo.find({
      order: { depth: "ASC", sortOrder: "ASC", id: "ASC" },
    });

    if (!rootSlug) return categories;

    const root = categories.find(
      (category) => category.parentId === null && category.slug === rootSlug
    );
    if (!root) return [];

    const allowed = new Set<number>([root.id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const category of categories) {
        if (category.parentId && allowed.has(category.parentId) && !allowed.has(category.id)) {
          allowed.add(category.id);
          changed = true;
        }
      }
    }

    return categories.filter((category) => allowed.has(category.id));
  }

  async findCategoryForest() {
    const categories = await this.findCategories();
    const pages = await this.pageRepo.find();
    return this.buildForest(
      categories.filter(
        (category) => !(category.parentId === null && EXCLUDED_ROOT_SLUGS.has(category.slug))
      ),
      pages
    );
  }

  async findCategoryTree(rootSlug: string) {
    const roots = await this.findCategoryForest();
    return roots.find((root) => root.slug === rootSlug) ?? null;
  }

  async createCategory(input: CategoryInput) {
    const parent = input.parentId
      ? await this.categoryRepo.findOne({ where: { id: input.parentId } })
      : null;

    if (input.parentId && !parent) {
      throw new NotFoundException("Parent category not found");
    }

    const depth = ((parent?.depth ?? 0) + 1) as 1 | 2 | 3;
    if (depth > 3) {
      throw new BadRequestException("Category depth cannot exceed 3");
    }

    const duplicate = await this.categoryRepo.findOne({
      where: {
        slug: input.slug,
        ...(parent ? { parentId: parent.id } : { parentId: IsNull() as any }),
      },
    });
    if (duplicate) {
      throw new BadRequestException("Slug already exists in this level");
    }

    const category = await this.categoryRepo.save(
      this.categoryRepo.create({
        parentId: parent?.id ?? null,
        name: input.name,
        slug: input.slug,
        depth,
        sortOrder: input.sortOrder ?? 0,
        status: input.status ?? "active",
      })
    );

    const page = await this.pageRepo.save(
      this.pageRepo.create({
        categoryId: category.id,
        title: input.name,
        content: "",
        templateCode: input.templateCode ?? "content",
        status: "draft",
      })
    );

    return { category, page };
  }

  async updateCategory(id: number, input: Partial<CategoryInput>) {
    const categories = await this.categoryRepo.find({
      order: { depth: "ASC", sortOrder: "ASC", id: "ASC" },
    });
    const category = categories.find((item) => item.id === id);
    if (!category) {
      throw new NotFoundException("Category not found");
    }

    const nextParentId = input.parentId !== undefined ? input.parentId : category.parentId;
    const nextParent =
      nextParentId === null
        ? null
        : categories.find((item) => item.id === nextParentId) ?? null;

    if (input.parentId !== undefined && nextParentId !== null && !nextParent) {
      throw new NotFoundException("Parent category not found");
    }

    if (nextParentId === id) {
      throw new BadRequestException("Category cannot be its own parent");
    }

    const descendants = this.collectDescendants(categories, id);
    const descendantIds = new Set(descendants.map((item) => item.id));
    if (nextParentId !== null && descendantIds.has(nextParentId)) {
      throw new BadRequestException("Category cannot be moved into its own child");
    }

    const nextDepth = ((nextParent?.depth ?? 0) + 1) as 1 | 2 | 3;
    const depthOffset = nextDepth - category.depth;
    const maxDepthAfterMove = Math.max(category.depth, ...descendants.map((item) => item.depth)) + depthOffset;
    if (maxDepthAfterMove > 3) {
      throw new BadRequestException("Category depth cannot exceed 3");
    }

    const nextSlug = input.slug ?? category.slug;
    const duplicate = categories.find(
      (item) =>
        item.id !== id &&
        item.parentId === nextParentId &&
        item.slug === nextSlug,
    );
    if (duplicate) {
      throw new BadRequestException("Slug already exists in this level");
    }

    Object.assign(category, {
      ...(input.parentId !== undefined && { parentId: nextParentId }),
      ...(input.name !== undefined && { name: input.name }),
      ...(input.slug !== undefined && { slug: nextSlug }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      ...(input.status !== undefined && { status: input.status }),
      depth: nextDepth,
    });

    await this.categoryRepo.save(category);

    if (depthOffset !== 0 && descendants.length > 0) {
      const updatedDescendants = descendants.map((item) => {
        item.depth = (item.depth + depthOffset) as 1 | 2 | 3;
        return item;
      });
      await this.categoryRepo.save(updatedDescendants);
    }

    return category;
  }

  async removeCategory(id: number) {
    const children = await this.categoryRepo.count({ where: { parentId: id } });
    if (children > 0) {
      throw new BadRequestException("Delete child categories first");
    }
    await this.categoryRepo.delete(id);
  }

  async findPage(id: number) {
    const page = await this.pageRepo.findOne({ where: { id } });
    if (!page) {
      throw new NotFoundException("Page not found");
    }
    const media = await this.mediaRepo.find({
      where: { pageId: id },
      order: { sortOrder: "ASC", id: "ASC" },
    });
    return { ...page, media };
  }

  async updatePage(id: number, input: PageUpdateInput) {
    const page = await this.pageRepo.findOne({ where: { id } });
    if (!page) {
      throw new NotFoundException("Page not found");
    }

    Object.assign(page, {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.content !== undefined && { content: input.content }),
      ...(input.templateCode !== undefined && { templateCode: input.templateCode }),
      ...(input.status !== undefined && { status: input.status }),
    });

    await this.pageRepo.save(page);

    if (input.media) {
      await this.mediaRepo.delete({ pageId: id });
      if (input.media.length > 0) {
        await this.mediaRepo.save(
          input.media.map((item) =>
            this.mediaRepo.create({
              pageId: id,
              slotKey: item.slotKey,
              mediaType: item.mediaType,
              url: item.url,
              thumbnailUrl: item.thumbnailUrl ?? null,
              altText: item.altText ?? null,
              sortOrder: item.sortOrder ?? 0,
            })
          )
        );
      }
    }

    return this.findPage(id);
  }

  async findPublicPage(rootSlug: string, slugs: string[]) {
    const root = await this.categoryRepo.findOne({
      where: { parentId: IsNull() as any, slug: rootSlug, status: "active" },
    });
    if (!root) {
      throw new NotFoundException("Root category not found");
    }

    const chain = slugs.filter(Boolean);
    if (chain.length === 0) {
      throw new NotFoundException("Category path not found");
    }

    const ancestors: ContentCategory[] = [];
    let parentId = root.id;
    let currentCategory: ContentCategory | null = null;

    for (const slug of chain) {
      currentCategory = await this.categoryRepo.findOne({
        where: { parentId, slug, status: "active" },
      });

      if (!currentCategory) {
        throw new NotFoundException("Category not found");
      }

      ancestors.push(currentCategory);
      parentId = currentCategory.id;
    }

    const targetCategory = currentCategory;
    if (!targetCategory) {
      throw new NotFoundException("Category not found");
    }

    const page = await this.pageRepo.findOne({
      where: { categoryId: targetCategory.id, status: "published" },
    });
    if (!page) {
      throw new NotFoundException("Published page not found");
    }

    const media = await this.mediaRepo.find({
      where: { pageId: page.id },
      order: { sortOrder: "ASC", id: "ASC" },
    });

    const siblingWhere =
      targetCategory.parentId === null
        ? ({ parentId: IsNull() as any, status: "active" } as any)
        : { parentId: targetCategory.parentId, status: "active" };

    const siblings = await this.categoryRepo.find({
      where: siblingWhere,
      order: { sortOrder: "ASC", id: "ASC" },
    });

    return {
      ...page,
      media,
      category: targetCategory,
      rootCategory: root,
      siblings,
      ancestors,
    };
  }

  private buildForest(categories: ContentCategory[], pages: ContentPage[]) {
    const pageByCategoryId = new Map(pages.map((page) => [page.categoryId, page] as const));
    const nodes = new Map<number, CategoryTreeNode>();

    for (const category of categories) {
      nodes.set(category.id, {
        ...category,
        page: pageByCategoryId.get(category.id) ?? null,
        children: [],
      });
    }

    const roots: CategoryTreeNode[] = [];
    for (const node of Array.from(nodes.values())) {
      if (node.parentId === null) {
        roots.push(node);
        continue;
      }
      nodes.get(node.parentId)?.children.push(node);
    }

    const sortNodes = (items: CategoryTreeNode[]) => {
      items.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
      for (const item of items) {
        sortNodes(item.children);
      }
    };

    sortNodes(roots);
    return roots;
  }

  private async ensureDefaultCategories() {
    for (const rootSeed of DEFAULT_CATEGORY_TREE) {
      await this.ensureSeedTree(rootSeed, null, 1);
    }
  }

  private async ensureDefaultPageContents() {
    for (const [pathKey, seed] of Object.entries(DEFAULT_PAGE_CONTENTS)) {
      const category = await this.findCategoryByPath(pathKey.split("/"));
      if (!category) {
        continue;
      }

      const page = await this.pageRepo.findOne({ where: { categoryId: category.id } });
      if (!page) {
        continue;
      }

      let changed = false;
      if (!page.title?.trim() || page.title === category.name) {
        page.title = seed.title;
        changed = true;
      }
      if (!page.content?.trim()) {
        page.content = seed.content;
        changed = true;
      }
      if (page.status !== "published") {
        page.status = "published";
        changed = true;
      }

      if (changed) {
        await this.pageRepo.save(page);
      }
    }
  }

  private async findCategoryByPath(slugs: string[]) {
    const [rootSlug, ...rest] = slugs;
    let current = await this.categoryRepo.findOne({
      where: { parentId: IsNull() as any, slug: rootSlug },
    });

    if (!current) {
      return null;
    }

    for (const slug of rest) {
      current = await this.categoryRepo.findOne({
        where: { parentId: current.id, slug },
      });
      if (!current) {
        return null;
      }
    }

    return current;
  }

  private async ensureSeedTree(
    seed: CategorySeedNode,
    parentId: number | null,
    depth: 1 | 2 | 3,
  ) {
    const category = await this.ensureCategory({
      parentId,
      depth,
      slug: seed.slug,
      name: seed.name,
      sortOrder: seed.sortOrder,
    });

    await this.ensurePageForCategory(category.id, seed.name, seed.templateCode ?? "content");

    for (const child of seed.children ?? []) {
      await this.ensureSeedTree(child, category.id, (depth + 1) as 1 | 2 | 3);
    }

    return category;
  }

  private async ensurePageForCategory(
    categoryId: number,
    title: string,
    templateCode: ContentTemplateCode,
  ) {
    const existing = await this.pageRepo.findOne({ where: { categoryId } });
    if (existing) {
      return existing;
    }

    return this.pageRepo.save(
      this.pageRepo.create({
        categoryId,
        title,
        content: "",
        templateCode,
        status: "published",
      })
    );
  }

  private async ensureCategory(input: {
    parentId: number | null;
    depth: 1 | 2 | 3;
    slug: string;
    name: string;
    sortOrder: number;
  }) {
    const existing = await this.categoryRepo.findOne({
      where:
        input.parentId === null
          ? ({ parentId: IsNull() as any, slug: input.slug } as any)
          : { parentId: input.parentId, slug: input.slug },
    });

    if (existing) {
      let changed = false;
      if (existing.name !== input.name) {
        existing.name = input.name;
        changed = true;
      }
      if (existing.sortOrder !== input.sortOrder) {
        existing.sortOrder = input.sortOrder;
        changed = true;
      }
      if (existing.depth !== input.depth) {
        existing.depth = input.depth;
        changed = true;
      }
      if (existing.status !== "active") {
        existing.status = "active";
        changed = true;
      }
      if (changed) {
        await this.categoryRepo.save(existing);
      }
      return existing;
    }

    return this.categoryRepo.save(
      this.categoryRepo.create({
        parentId: input.parentId,
        depth: input.depth,
        slug: input.slug,
        name: input.name,
        sortOrder: input.sortOrder,
        status: "active",
      })
    );
  }

  private collectDescendants(categories: ContentCategory[], parentId: number) {
    const bucket: ContentCategory[] = [];
    const walk = (id: number) => {
      const children = categories.filter((item) => item.parentId === id);
      for (const child of children) {
        bucket.push(child);
        walk(child.id);
      }
    };

    walk(parentId);
    return bucket;
  }
}


