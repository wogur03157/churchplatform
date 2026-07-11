import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { ContentCategory } from "../content-pages/entities/content-category.entity";
import { Image } from "../images/entities/image.entity";
import { VideoCategory } from "../video-categories/entities/video-category.entity";
import { Video } from "../videos/entities/video.entity";
import { Media } from "./entities/media.entity";

const MEDIA_ROOT_SLUG = "media";
const MEDIA_ROOT_NAME = "미디어";

const DEFAULT_MEDIA_CATEGORIES = [
  { slug: "sunday", name: "주일설교", sortOrder: 10 },
  { slug: "wednesday", name: "수요설교", sortOrder: 20 },
  { slug: "friday", name: "금요설교", sortOrder: 30 },
  { slug: "special", name: "특별설교", sortOrder: 40 },
];
type MediaCategoryInput = {
  name: string;
  slug: string;
  displayOrder?: number;
};

type VideoInput = {
  title: string;
  description?: string | null;
  videoType: "upload" | "youtube" | "vimeo" | "url";
  url: string;
  fileKey?: string | null;
  thumbnailUrl?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  duration?: number | null;
  uploadedBy: number;
  status: "published" | "draft";
  displayOrder: number;
  churchId?: number | null;
  category?: string | null;
};

type ImageInput = {
  title: string;
  description?: string | null;
  fileKey: string;
  url: string;
  mimeType?: string | null;
  fileSize?: number | null;
  uploadedBy: number;
  status: "published" | "draft";
  displayOrder: number;
  showOnHome?: boolean;
  churchId?: number | null;
  category?: string | null;
};

@Injectable()
export class MediaService {
  private initPromise: Promise<void> | null = null;

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
    @InjectRepository(ContentCategory)
    private readonly categoryRepo: Repository<ContentCategory>,
    @InjectRepository(Video)
    private readonly legacyVideoRepo: Repository<Video>,
    @InjectRepository(Image)
    private readonly legacyImageRepo: Repository<Image>,
    @InjectRepository(VideoCategory)
    private readonly legacyVideoCategoryRepo: Repository<VideoCategory>,
  ) {}

  async onModuleInit() {
    await this.ensureInitialized();
  }

  async findVideos(publishedOnly = false, categorySlug?: string | null) {
    await this.ensureInitialized();

    const query = this.mediaRepo
      .createQueryBuilder("media")
      .leftJoinAndSelect("media.category", "category")
      .where("media.mediaType = :mediaType", { mediaType: "video" });

    if (publishedOnly) {
      query.andWhere("media.status = :status", { status: "published" });
    }

    if (categorySlug) {
      query.andWhere("category.slug = :categorySlug", { categorySlug });
    }

    const rows = await query
      .orderBy("media.displayOrder", "ASC")
      .addOrderBy("media.createdAt", "DESC")
      .getMany();

    return rows.map((row) => this.toVideoDto(row));
  }

  async findVideo(id: number) {
    await this.ensureInitialized();
    const row = await this.mediaRepo.findOne({
      where: { id, mediaType: "video" },
      relations: { category: true },
    });
    return row ? this.toVideoDto(row) : null;
  }

  async createVideo(input: VideoInput) {
    await this.ensureInitialized();
    const categoryId = await this.resolveMediaCategoryId(input.category ?? null);
    const row = this.mediaRepo.create({
      churchId: input.churchId ?? null,
      categoryId,
      title: input.title,
      description: input.description ?? null,
      mediaType: "video",
      videoType: input.videoType,
      fileKey: input.fileKey ?? null,
      url: input.url,
      thumbnailUrl: input.thumbnailUrl ?? null,
      mimeType: input.mimeType ?? null,
      fileSize: input.fileSize ?? null,
      duration: input.duration ?? null,
      uploadedBy: input.uploadedBy,
      status: input.status,
      displayOrder: input.displayOrder,
      showOnHome: false,
      altText: null,
    });
    return this.mediaRepo.save(row);
  }

  async updateVideo(id: number, data: Record<string, unknown>) {
    await this.ensureInitialized();
    const row = await this.mediaRepo.findOne({ where: { id, mediaType: "video" } });
    if (!row) {
      throw new NotFoundException("Video not found");
    }

    if (data.category !== undefined) {
      row.categoryId = await this.resolveMediaCategoryId((data.category as string | null) ?? null);
    }

    Object.assign(row, {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.url !== undefined && { url: data.url }),
      ...(data.thumbnailUrl !== undefined && { thumbnailUrl: data.thumbnailUrl }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
      ...(data.videoType !== undefined && { videoType: data.videoType }),
    });

    await this.mediaRepo.save(row);
  }

  async removeVideo(id: number) {
    await this.ensureInitialized();
    await this.mediaRepo.delete({ id, mediaType: "video" });
  }

  async findImages(publishedOnly = false, categorySlug?: string | null) {
    await this.ensureInitialized();

    const query = this.mediaRepo
      .createQueryBuilder("media")
      .leftJoinAndSelect("media.category", "category")
      .where("media.mediaType = :mediaType", { mediaType: "image" });

    if (publishedOnly) {
      query.andWhere("media.status = :status", { status: "published" });
    }

    if (categorySlug) {
      query.andWhere("category.slug = :categorySlug", { categorySlug });
    }

    const rows = await query
      .orderBy("media.displayOrder", "ASC")
      .addOrderBy("media.createdAt", "DESC")
      .getMany();

    return rows.map((row) => this.toImageDto(row));
  }

  async findImage(id: number) {
    await this.ensureInitialized();
    const row = await this.mediaRepo.findOne({
      where: { id, mediaType: "image" },
      relations: { category: true },
    });
    return row ? this.toImageDto(row) : null;
  }

  async createImage(input: ImageInput) {
    await this.ensureInitialized();
    const categoryId = await this.resolveMediaCategoryId(input.category ?? null);
    const row = this.mediaRepo.create({
      churchId: input.churchId ?? null,
      categoryId,
      title: input.title,
      description: input.description ?? null,
      mediaType: "image",
      videoType: null,
      fileKey: input.fileKey,
      url: input.url,
      thumbnailUrl: null,
      mimeType: input.mimeType ?? null,
      fileSize: input.fileSize ?? null,
      duration: null,
      uploadedBy: input.uploadedBy,
      status: input.status,
      displayOrder: input.displayOrder,
      showOnHome: input.showOnHome ?? false,
      altText: input.title,
    });
    return this.mediaRepo.save(row);
  }

  async updateImage(id: number, data: Record<string, unknown>) {
    await this.ensureInitialized();
    const row = await this.mediaRepo.findOne({ where: { id, mediaType: "image" } });
    if (!row) {
      throw new NotFoundException("Image not found");
    }

    if (data.category !== undefined) {
      row.categoryId = await this.resolveMediaCategoryId((data.category as string | null) ?? null);
    }

    Object.assign(row, {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
      ...(data.showOnHome !== undefined && { showOnHome: data.showOnHome }),
    });

    await this.mediaRepo.save(row);
  }

  async removeImage(id: number) {
    await this.ensureInitialized();
    await this.mediaRepo.delete({ id, mediaType: "image" });
  }

  async listMediaCategories() {
    await this.ensureInitialized();
    const root = await this.ensureMediaRoot();
    const rows = await this.categoryRepo.find({
      where: { parentId: root.id },
      order: { sortOrder: "ASC", id: "ASC" },
    });
    return rows.map((row) => this.toCategoryDto(row));
  }

  async findMediaCategory(id: number) {
    await this.ensureInitialized();
    const row = await this.categoryRepo.findOne({ where: { id } });
    if (!row || row.parentId === null) {
      return null;
    }
    return this.toCategoryDto(row);
  }

  async createMediaCategory(input: MediaCategoryInput) {
    await this.ensureInitialized();
    const root = await this.ensureMediaRoot();

    const duplicate = await this.categoryRepo.findOne({
      where: { parentId: root.id, slug: input.slug },
    });
    if (duplicate) {
      throw new BadRequestException("Slug already exists");
    }

    const row = await this.categoryRepo.save(
      this.categoryRepo.create({
        churchId: null,
        parentId: root.id,
        name: input.name,
        slug: input.slug,
        depth: 2,
        sortOrder: input.displayOrder ?? 0,
        status: "active",
      }),
    );

    return this.toCategoryDto(row);
  }

  async updateMediaCategory(id: number, input: Partial<MediaCategoryInput>) {
    await this.ensureInitialized();
    const row = await this.categoryRepo.findOne({ where: { id } });
    if (!row || row.parentId === null) {
      throw new NotFoundException("Category not found");
    }

    if (input.slug && input.slug !== row.slug) {
      const duplicate = await this.categoryRepo.findOne({
        where: { parentId: row.parentId, slug: input.slug },
      });
      if (duplicate && duplicate.id !== row.id) {
        throw new BadRequestException("Slug already exists");
      }
    }

    Object.assign(row, {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.displayOrder !== undefined && { sortOrder: input.displayOrder }),
    });

    await this.categoryRepo.save(row);
  }

  async removeMediaCategory(id: number) {
    await this.ensureInitialized();
    const mediaCount = await this.mediaRepo.count({ where: { categoryId: id } });
    if (mediaCount > 0) {
      throw new BadRequestException("Delete media in this category first");
    }
    await this.categoryRepo.delete(id);
  }

  private async ensureInitialized() {
    if (!this.initPromise) {
      this.initPromise = this.bootstrapLegacyData();
    }
    await this.initPromise;
  }

  private async bootstrapLegacyData() {
    const root = await this.ensureMediaRoot();
    await this.migrateLegacyCategories(root.id);
    await this.ensureDefaultMediaCategories(root.id);
    await this.migrateLegacyVideos(root.id);
    await this.migrateLegacyImages();
  }

  private async ensureMediaRoot() {
    let root = await this.categoryRepo.findOne({
      where: { parentId: IsNull(), slug: MEDIA_ROOT_SLUG },
    });

    if (!root) {
      root = await this.categoryRepo.save(
        this.categoryRepo.create({
          churchId: null,
          parentId: null,
          name: MEDIA_ROOT_NAME,
          slug: MEDIA_ROOT_SLUG,
          depth: 1,
          sortOrder: 0,
          status: "active",
        }),
      );
    }

    return root;
  }

  private async migrateLegacyCategories(rootId: number) {
    const legacyRows = await this.legacyVideoCategoryRepo.find({
      order: { displayOrder: "ASC", id: "ASC" },
    });

    for (const row of legacyRows) {
      const existing = await this.categoryRepo.findOne({
        where: { parentId: rootId, slug: row.slug },
      });
      if (existing) {
        continue;
      }

      await this.categoryRepo.save(
        this.categoryRepo.create({
          churchId: row.churchId,
          parentId: rootId,
          name: row.name,
          slug: row.slug,
          depth: 2,
          sortOrder: row.displayOrder,
          status: "active",
        }),
      );
    }
  }

  private async ensureDefaultMediaCategories(rootId: number) {
    for (const seed of DEFAULT_MEDIA_CATEGORIES) {
      const existing = await this.categoryRepo.findOne({
        where: { parentId: rootId, slug: seed.slug },
      });

      if (existing) {
        let changed = false;
        if (existing.name !== seed.name) {
          existing.name = seed.name;
          changed = true;
        }
        if (existing.sortOrder !== seed.sortOrder) {
          existing.sortOrder = seed.sortOrder;
          changed = true;
        }
        if (existing.status !== "active") {
          existing.status = "active";
          changed = true;
        }
        if (changed) {
          await this.categoryRepo.save(existing);
        }
        continue;
      }

      await this.categoryRepo.save(
        this.categoryRepo.create({
          churchId: null,
          parentId: rootId,
          name: seed.name,
          slug: seed.slug,
          depth: 2,
          sortOrder: seed.sortOrder,
          status: "active",
        }),
      );
    }
  }

  private async migrateLegacyVideos(rootId: number) {
    const existing = await this.mediaRepo.find({
      where: { legacySource: "videos" },
      select: { legacyId: true },
    });
    const migratedIds = new Set(existing.map((row) => row.legacyId).filter((id): id is number => typeof id === "number"));

    const legacyRows = await this.legacyVideoRepo.find();
    const toInsert: Media[] = [];

    for (const row of legacyRows) {
      if (migratedIds.has(row.id)) {
        continue;
      }

      const categoryId = row.category
        ? (await this.ensureMediaCategoryBySlug(rootId, row.category)).id
        : null;

      toInsert.push(
        this.mediaRepo.create({
          legacySource: "videos",
          legacyId: row.id,
          churchId: row.churchId,
          categoryId,
          title: row.title,
          description: row.description,
          mediaType: "video",
          videoType: row.videoType,
          fileKey: row.fileKey,
          url: row.url,
          thumbnailUrl: row.thumbnailUrl,
          mimeType: row.mimeType,
          fileSize: row.fileSize,
          duration: row.duration,
          uploadedBy: row.uploadedBy,
          status: row.status,
          displayOrder: row.displayOrder,
          showOnHome: false,
          altText: null,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        }),
      );
    }

    if (toInsert.length > 0) {
      await this.mediaRepo.save(toInsert);
    }
  }

  private async migrateLegacyImages() {
    const existing = await this.mediaRepo.find({
      where: { legacySource: "images" },
      select: { legacyId: true },
    });
    const migratedIds = new Set(existing.map((row) => row.legacyId).filter((id): id is number => typeof id === "number"));

    const legacyRows = await this.legacyImageRepo.find();
    const toInsert: Media[] = [];

    for (const row of legacyRows) {
      if (migratedIds.has(row.id)) {
        continue;
      }

      toInsert.push(
        this.mediaRepo.create({
          legacySource: "images",
          legacyId: row.id,
          churchId: row.churchId,
          categoryId: null,
          title: row.title,
          description: row.description,
          mediaType: "image",
          videoType: null,
          fileKey: row.fileKey,
          url: row.url,
          thumbnailUrl: null,
          mimeType: row.mimeType,
          fileSize: row.fileSize,
          duration: null,
          uploadedBy: row.uploadedBy,
          status: row.status,
          displayOrder: row.displayOrder,
          showOnHome: row.showOnHome,
          altText: row.title,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        }),
      );
    }

    if (toInsert.length > 0) {
      await this.mediaRepo.save(toInsert);
    }
  }

  private async resolveMediaCategoryId(categorySlug: string | null) {
    if (!categorySlug) {
      return null;
    }

    const root = await this.ensureMediaRoot();
    const category = await this.ensureMediaCategoryBySlug(root.id, categorySlug);
    return category.id;
  }

  private async ensureMediaCategoryBySlug(rootId: number, slug: string) {
    let category = await this.categoryRepo.findOne({
      where: { parentId: rootId, slug },
    });

    if (!category) {
      category = await this.categoryRepo.save(
        this.categoryRepo.create({
          churchId: null,
          parentId: rootId,
          name: this.humanizeSlug(slug),
          slug,
          depth: 2,
          sortOrder: 0,
          status: "active",
        }),
      );
    }

    return category;
  }

  private humanizeSlug(slug: string) {
    return slug
      .split(/[-_]/g)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  private toCategoryDto(row: ContentCategory) {
    return {
      id: row.id,
      churchId: row.churchId,
      name: row.name,
      slug: row.slug,
      isBuiltIn: false,
      displayOrder: row.sortOrder,
    };
  }

  private toVideoDto(row: Media) {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      videoType: row.videoType ?? "url",
      fileKey: row.fileKey,
      url: row.url,
      thumbnailUrl: row.thumbnailUrl,
      mimeType: row.mimeType,
      fileSize: row.fileSize,
      duration: row.duration,
      churchId: row.churchId,
      uploadedBy: row.uploadedBy,
      status: row.status,
      displayOrder: row.displayOrder,
      categoryId: row.categoryId,
      category: row.category?.slug ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private toImageDto(row: Media) {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      fileKey: row.fileKey ?? "",
      url: row.url,
      mimeType: row.mimeType ?? "",
      fileSize: row.fileSize,
      uploadedBy: row.uploadedBy,
      churchId: row.churchId,
      status: row.status,
      displayOrder: row.displayOrder,
      showOnHome: row.showOnHome,
      categoryId: row.categoryId,
      category: row.category?.slug ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}


