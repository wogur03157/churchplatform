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
import { DEFAULT_PAGE_CONTENTS } from "./default-page-contents";

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
          { slug: "training", name: "제자반 / 사역반", sortOrder: 10 },
          { slug: "bible-study", name: "성경대학", sortOrder: 20 },
          { slug: "online-book", name: "온라인 독서모임", sortOrder: 30 },
        ],
      },
      {
        slug: "neighbor-love",
        name: "이웃사랑",
        sortOrder: 20,
        children: [
          { slug: "love-box", name: "사랑나눔박스", sortOrder: 10 },
          { slug: "music-academy", name: "뮤직아카데미", sortOrder: 30 },
          { slug: "happy-univ", name: "행복한대학", sortOrder: 40 },
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
      category => category.parentId === null && category.slug === rootSlug
    );
    if (!root) return [];

    const allowed = new Set<number>([root.id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const category of categories) {
        if (
          category.parentId &&
          allowed.has(category.parentId) &&
          !allowed.has(category.id)
        ) {
          allowed.add(category.id);
          changed = true;
        }
      }
    }

    return categories.filter(category => allowed.has(category.id));
  }

  async findCategoryForest() {
    const categories = await this.findCategories();
    const pages = await this.pageRepo.find();
    return this.buildForest(
      categories.filter(
        category =>
          !(
            category.parentId === null && EXCLUDED_ROOT_SLUGS.has(category.slug)
          )
      ),
      pages
    );
  }

  async findCategoryTree(rootSlug: string) {
    const roots = await this.findCategoryForest();
    return roots.find(root => root.slug === rootSlug) ?? null;
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
    const category = categories.find(item => item.id === id);
    if (!category) {
      throw new NotFoundException("Category not found");
    }

    const nextParentId =
      input.parentId !== undefined ? input.parentId : category.parentId;
    const nextParent =
      nextParentId === null
        ? null
        : (categories.find(item => item.id === nextParentId) ?? null);

    if (input.parentId !== undefined && nextParentId !== null && !nextParent) {
      throw new NotFoundException("Parent category not found");
    }

    if (nextParentId === id) {
      throw new BadRequestException("Category cannot be its own parent");
    }

    const descendants = this.collectDescendants(categories, id);
    const descendantIds = new Set(descendants.map(item => item.id));
    if (nextParentId !== null && descendantIds.has(nextParentId)) {
      throw new BadRequestException(
        "Category cannot be moved into its own child"
      );
    }

    const nextDepth = ((nextParent?.depth ?? 0) + 1) as 1 | 2 | 3;
    const depthOffset = nextDepth - category.depth;
    const maxDepthAfterMove =
      Math.max(category.depth, ...descendants.map(item => item.depth)) +
      depthOffset;
    if (maxDepthAfterMove > 3) {
      throw new BadRequestException("Category depth cannot exceed 3");
    }

    const nextSlug = input.slug ?? category.slug;
    const duplicate = categories.find(
      item =>
        item.id !== id &&
        item.parentId === nextParentId &&
        item.slug === nextSlug
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
      const updatedDescendants = descendants.map(item => {
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
      ...(input.templateCode !== undefined && {
        templateCode: input.templateCode,
      }),
      ...(input.status !== undefined && { status: input.status }),
    });

    await this.pageRepo.save(page);

    if (input.media) {
      await this.mediaRepo.delete({ pageId: id });
      if (input.media.length > 0) {
        await this.mediaRepo.save(
          input.media.map(item =>
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
    const pageByCategoryId = new Map(
      pages.map(page => [page.categoryId, page] as const)
    );
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

      const page = await this.pageRepo.findOne({
        where: { categoryId: category.id },
      });
      if (!page) {
        continue;
      }

      let changed = false;
      if (!page.title?.trim() || page.title === category.name) {
        page.title = seed.title;
        changed = true;
      }
      const hasRealContent = page.content
        ? page.content.replace(/<[^>]*>/g, "").trim().length > 0
        : false;
      if (!hasRealContent) {
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
    depth: 1 | 2 | 3
  ) {
    const category = await this.ensureCategory({
      parentId,
      depth,
      slug: seed.slug,
      name: seed.name,
      sortOrder: seed.sortOrder,
    });

    await this.ensurePageForCategory(
      category.id,
      seed.name,
      seed.templateCode ?? "content"
    );

    for (const child of seed.children ?? []) {
      await this.ensureSeedTree(child, category.id, (depth + 1) as 1 | 2 | 3);
    }

    return category;
  }

  private async ensurePageForCategory(
    categoryId: number,
    title: string,
    templateCode: ContentTemplateCode
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
      const children = categories.filter(item => item.parentId === id);
      for (const child of children) {
        bucket.push(child);
        walk(child.id);
      }
    };

    walk(parentId);
    return bucket;
  }
}
