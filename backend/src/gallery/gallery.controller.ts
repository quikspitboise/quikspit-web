import { Controller, Get } from '@nestjs/common';
import { GalleryItemDto, GalleryService } from './gallery.service';

@Controller('api/gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get()
  async list(): Promise<{ items: GalleryItemDto[] }> {
    const items = await this.galleryService.list();
    return { items };
  }
}


