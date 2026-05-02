import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AdminAllowlistGuard } from '../auth/admin-allowlist.guard';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto';
import { ReorderGalleryItemsDto } from './dto/reorder-gallery-items.dto';
import { UpdateGalleryItemDto } from './dto/update-gallery-item.dto';
import {
  GalleryItemDto,
  GalleryService,
} from './gallery.service';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get()
  async list(): Promise<{ items: GalleryItemDto[] }> {
    const items = await this.galleryService.list();
    return { items };
  }

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @UseGuards(ClerkAuthGuard, AdminAllowlistGuard)
  @Get('admin/items')
  async listAdmin() {
    const items = await this.galleryService.listAdmin();
    return { items };
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @UseGuards(ClerkAuthGuard, AdminAllowlistGuard)
  @Post('admin/items')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateGalleryItemDto,
  ) {
    const item = await this.galleryService.create(request.clerkAuth!.userId, dto);

    return { item };
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @UseGuards(ClerkAuthGuard, AdminAllowlistGuard)
  @Patch('admin/items/:id')
  async update(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateGalleryItemDto,
  ) {
    const item = await this.galleryService.update(
      id,
      request.clerkAuth!.userId,
      dto,
    );

    return { item };
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @UseGuards(ClerkAuthGuard, AdminAllowlistGuard)
  @Post('admin/items/:id/assets')
  async replaceAssets(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateGalleryItemDto,
  ) {
    const item = await this.galleryService.replaceAssets(
      id,
      request.clerkAuth!.userId,
      {
        imageAsset: dto.imageAsset,
        beforeAsset: dto.beforeAsset,
        afterAsset: dto.afterAsset,
      },
    );

    return { item };
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @UseGuards(ClerkAuthGuard, AdminAllowlistGuard)
  @Post('admin/reorder')
  async reorder(
    @Req() request: AuthenticatedRequest,
    @Body() dto: ReorderGalleryItemsDto,
  ) {
    const items = await this.galleryService.reorder(
      request.clerkAuth!.userId,
      dto,
    );

    return { items };
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @UseGuards(ClerkAuthGuard, AdminAllowlistGuard)
  @Delete('admin/items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    await this.galleryService.remove(id, request.clerkAuth!.userId);
  }
}
