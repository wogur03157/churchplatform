import { Inject, Injectable } from "@nestjs/common";
import { MediaService } from "../media/media.service";

@Injectable()
export class ImagesService {
  constructor(
    @Inject(MediaService)
    private readonly mediaService: MediaService,
  ) {}

  async findAll(publishedOnly = false, categorySlug?: string | null) {
    return this.mediaService.findImages(publishedOnly, categorySlug ?? null);
  }

  async findOne(id: number) {
    return this.mediaService.findImage(id);
  }

  async create(data: {
    title: string;
    description?: string;
    fileKey: string;
    url: string;
    mimeType?: string;
    fileSize?: number;
    uploadedBy: number;
    status: "published" | "draft";
    displayOrder: number;
    showOnHome?: boolean;
    category?: string | null;
  }) {
    return this.mediaService.createImage(data);
  }

  async update(
    id: number,
    data: Partial<{
      title: string;
      description: string | null;
      status: "published" | "draft";
      displayOrder: number;
      showOnHome: boolean;
    }>
  ): Promise<void> {
    await this.mediaService.updateImage(id, data as Record<string, unknown>);
  }

  async remove(id: number): Promise<void> {
    await this.mediaService.removeImage(id);
  }
}
