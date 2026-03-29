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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
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
  type GalleryUploadFiles,
} from './gallery.service';

const galleryUploadInterceptor = FileFieldsInterceptor(
  [
    { name: 'image', maxCount: 1 },
    { name: 'beforeImage', maxCount: 1 },
    { name: 'afterImage', maxCount: 1 },
  ],
  {
    storage: memoryStorage(),
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return callback(new Error('Only image files are allowed'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  },
);

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
  @UseInterceptors(galleryUploadInterceptor)
  async create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateGalleryItemDto,
    @UploadedFiles() files: GalleryUploadFiles,
  ) {
    const item = await this.galleryService.create(
      request.clerkAuth!.userId,
      dto,
      files,
    );

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
  @UseInterceptors(galleryUploadInterceptor)
  async replaceAssets(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @UploadedFiles() files: GalleryUploadFiles,
  ) {
    const item = await this.galleryService.replaceAssets(
      id,
      request.clerkAuth!.userId,
      files,
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
