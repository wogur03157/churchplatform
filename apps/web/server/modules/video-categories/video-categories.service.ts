import { Inject, Injectable } from "@nestjs/common";
import { MediaService } from "../media/media.service";

@Injectable()
export class VideoCategoriesService {
  constructor(
    @Inject(MediaService)
    private readonly mediaService: MediaService,
  ) {}

  findAll() {
    return this.mediaService.listMediaCategories();
  }

  findOne(id: number) {
    return this.mediaService.findMediaCategory(id);
  }

  create(data: { name: string; slug: string; displayOrder?: number }) {
    return this.mediaService.createMediaCategory(data);
  }

  async update(id: number, data: { name?: string; slug?: string; displayOrder?: number }) {
    await this.mediaService.updateMediaCategory(id, data);
  }

  async remove(id: number) {
    await this.mediaService.removeMediaCategory(id);
  }
}
