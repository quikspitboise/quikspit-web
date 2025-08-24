import { Controller, Get } from '@nestjs/common';
import { GalleryItemDto, GalleryService } from './gallery.service';

// Route becomes /api/gallery due to global prefix configured in main.ts
@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get()
  async list(): Promise<{ items: GalleryItemDto[] }> {
    const items = await this.galleryService.list();
    return { items };
  }
}


