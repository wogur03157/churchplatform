import { Inject, Injectable } from "@nestjs/common";
import { MediaService } from "../media/media.service";

@Injectable()
export class VideosService {
  constructor(
    @Inject(MediaService)
    private readonly mediaService: MediaService,
  ) {}

  async findAll(publishedOnly = false, categorySlug?: string | null) {
    return this.mediaService.findVideos(publishedOnly, categorySlug ?? null);
  }

  async findOne(id: number) {
    return this.mediaService.findVideo(id);
  }

  async create(data: {
    title: string;
    description?: string;
    videoType: "upload" | "youtube" | "vimeo" | "url";
    url: string;
    fileKey?: string;
    thumbnailUrl?: string;
    mimeType?: string;
    fileSize?: number;
    duration?: number;
    uploadedBy: number;
    status: "published" | "draft";
    displayOrder: number;
    category?: string | null;
  }) {
    return this.mediaService.createVideo(data);
  }

  async update(id: number, data: Record<string, unknown>): Promise<void> {
    await this.mediaService.updateVideo(id, data);
  }

  async remove(id: number): Promise<void> {
    await this.mediaService.removeVideo(id);
  }
}
