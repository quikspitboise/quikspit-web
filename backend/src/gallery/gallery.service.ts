import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { FileValidationService } from '../common/file-validation.service';
import { LoggerService } from '../common/logger.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto';
import { ReorderGalleryItemsDto } from './dto/reorder-gallery-items.dto';
import { UpdateGalleryItemDto } from './dto/update-gallery-item.dto';
import { DEFAULT_GALLERY_ITEMS } from './default-gallery-items';
import { CloudinaryAssetDto } from './dto/cloudinary-asset.dto';
import {
  GalleryAssetType,
  GalleryCloudinaryAsset,
  GalleryItemEntity,
} from './entities/gallery-item.entity';

export interface GalleryItemDto {
  id: string;
  title: string;
  description?: string;
  altText?: string;
  categories?: string[];
  tags?: string[];
  beforeUrl?: string;
  afterUrl?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface GalleryAdminItemDto extends GalleryItemDto {
  categories: string[];
  tags: string[];
  assetType: GalleryAssetType;
  displayOrder: number;
  isVisible: boolean;
  imagePublicId?: string | null;
  beforePublicId?: string | null;
  afterPublicId?: string | null;
  updatedAt: string;
  createdByUserId?: string | null;
  updatedByUserId?: string | null;
}

export type GalleryUploadFiles = {
  image?: Express.Multer.File[];
  beforeImage?: Express.Multer.File[];
  afterImage?: Express.Multer.File[];
};

@Injectable()
export class GalleryService implements OnModuleInit {
  constructor(
    @InjectRepository(GalleryItemEntity)
    private readonly galleryRepository: Repository<GalleryItemEntity>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedDefaultsIfEmpty();
    await this.backfillMissingCategories();
  }

  async list(): Promise<GalleryItemDto[]> {
    const items = await this.galleryRepository.find({
      where: {
        isVisible: true,
      },
      order: {
        displayOrder: 'ASC',
        createdAt: 'ASC',
      },
    });

    return items.map((item) => this.toPublicDto(item));
  }

  async listAdmin(): Promise<GalleryAdminItemDto[]> {
    const items = await this.galleryRepository.find({
      order: {
        displayOrder: 'ASC',
        createdAt: 'ASC',
      },
    });

    return items.map((item) => this.toAdminDto(item));
  }

  async create(
    adminUserId: string,
    dto: CreateGalleryItemDto,
  ): Promise<GalleryAdminItemDto> {
    const directUploadAssets = this.resolveDirectUploadAssets(dto.assetType, {
      imageAsset: dto.imageAsset,
      beforeAsset: dto.beforeAsset,
      afterAsset: dto.afterAsset,
    });

    const nextDisplayOrder = await this.resolveDisplayOrder(dto.displayOrder);

    const item = this.galleryRepository.create({
      id: randomUUID(),
      title: dto.title,
      description: dto.description ?? null,
      altText: dto.altText ?? null,
      categories: this.normalizeCategories(dto.categories, dto.assetType),
      tags: this.normalizeStringList(dto.tags),
      assetType: dto.assetType,
      imagePublicId: directUploadAssets.imageAsset?.publicId ?? null,
      beforePublicId: directUploadAssets.beforeAsset?.publicId ?? null,
      afterPublicId: directUploadAssets.afterAsset?.publicId ?? null,
      imageAsset: directUploadAssets.imageAsset,
      beforeAsset: directUploadAssets.beforeAsset,
      afterAsset: directUploadAssets.afterAsset,
      isVisible: dto.isVisible ?? true,
      displayOrder: nextDisplayOrder,
      createdByUserId: adminUserId,
      updatedByUserId: adminUserId,
    });

    const savedItem = await this.galleryRepository.save(item);
    this.logger.log('Gallery item created', {
      galleryItemId: savedItem.id,
      adminUserId,
      assetType: savedItem.assetType,
    });

    return this.toAdminDto(savedItem);
  }

  async update(
    id: string,
    adminUserId: string,
    dto: UpdateGalleryItemDto,
  ): Promise<GalleryAdminItemDto> {
    const item = await this.findOneOrThrow(id);

    if (dto.title !== undefined) {
      item.title = dto.title;
    }

    if (dto.description !== undefined) {
      item.description = dto.description ?? null;
    }

    if (dto.altText !== undefined) {
      item.altText = dto.altText ?? null;
    }

    if (dto.categories !== undefined) {
      item.categories = this.normalizeCategories(dto.categories, item.assetType);
    }

    if (dto.tags !== undefined) {
      item.tags = this.normalizeStringList(dto.tags);
    }

    if (dto.displayOrder !== undefined) {
      item.displayOrder = dto.displayOrder;
    }

    if (dto.isVisible !== undefined) {
      item.isVisible = dto.isVisible;
    }

    item.updatedByUserId = adminUserId;

    const savedItem = await this.galleryRepository.save(item);
    this.logger.log('Gallery item updated', {
      galleryItemId: savedItem.id,
      adminUserId,
    });

    return this.toAdminDto(savedItem);
  }

  async replaceAssets(
    id: string,
    adminUserId: string,
    assets?: {
      imageAsset?: CloudinaryAssetDto;
      beforeAsset?: CloudinaryAssetDto;
      afterAsset?: CloudinaryAssetDto;
    },
  ): Promise<GalleryAdminItemDto> {
    const item = await this.findOneOrThrow(id);
    const directUploadAssets = this.resolveDirectUploadAssets(item.assetType, {
      imageAsset: assets?.imageAsset,
      beforeAsset: assets?.beforeAsset,
      afterAsset: assets?.afterAsset,
    });

    const previousPublicIds = this.getTrackedPublicIds(item);

    item.imagePublicId =
      directUploadAssets.imageAsset?.publicId ?? item.imagePublicId ?? null;
    item.beforePublicId =
      directUploadAssets.beforeAsset?.publicId ?? item.beforePublicId ?? null;
    item.afterPublicId =
      directUploadAssets.afterAsset?.publicId ?? item.afterPublicId ?? null;
    item.imageAsset = directUploadAssets.imageAsset ?? item.imageAsset ?? null;
    item.beforeAsset = directUploadAssets.beforeAsset ?? item.beforeAsset ?? null;
    item.afterAsset = directUploadAssets.afterAsset ?? item.afterAsset ?? null;
    item.updatedByUserId = adminUserId;

    const savedItem = await this.galleryRepository.save(item);

    await this.deleteTrackedPublicIds(
      previousPublicIds.filter(
        (publicId) => !this.getTrackedPublicIds(savedItem).includes(publicId),
      ),
    );

    this.logger.log('Gallery item assets replaced', {
      galleryItemId: savedItem.id,
      adminUserId,
    });

    return this.toAdminDto(savedItem);
  }

  async reorder(
    adminUserId: string,
    dto: ReorderGalleryItemsDto,
  ): Promise<GalleryAdminItemDto[]> {
    const existingItems = await this.galleryRepository.find({
      order: {
        displayOrder: 'ASC',
        createdAt: 'ASC',
      },
    });

    if (existingItems.length === 0) {
      return [];
    }

    const itemMap = new Map(existingItems.map((item) => [item.id, item]));
    const uniqueIds = Array.from(new Set(dto.ids));

    for (const id of uniqueIds) {
      if (!itemMap.has(id)) {
        throw new NotFoundException(`Gallery item ${id} was not found`);
      }
    }

    const remainingItems = existingItems.filter(
      (item) => !uniqueIds.includes(item.id),
    );
    const orderedItems = [
      ...uniqueIds.map((id) => itemMap.get(id)!),
      ...remainingItems,
    ];

    orderedItems.forEach((item, index) => {
      item.displayOrder = index;
      item.updatedByUserId = adminUserId;
    });

    const savedItems = await this.galleryRepository.save(orderedItems);
    this.logger.log('Gallery items reordered', {
      adminUserId,
      reorderedCount: savedItems.length,
    });

    return savedItems
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .map((item) => this.toAdminDto(item));
  }

  async remove(id: string, adminUserId: string): Promise<void> {
    const item = await this.findOneOrThrow(id);
    const publicIds = this.getTrackedPublicIds(item);

    await this.galleryRepository.remove(item);
    await this.deleteTrackedPublicIds(publicIds);

    this.logger.log('Gallery item deleted', {
      galleryItemId: id,
      adminUserId,
    });
  }

  private async seedDefaultsIfEmpty(): Promise<void> {
    const currentCount = await this.galleryRepository.count();
    if (currentCount > 0) {
      return;
    }

    const seededItems = DEFAULT_GALLERY_ITEMS.map((item, index) =>
      this.galleryRepository.create({
        ...item,
        description: item.description ?? null,
      imagePublicId: item.imagePublicId ?? null,
      beforePublicId: item.beforePublicId ?? null,
      afterPublicId: item.afterPublicId ?? null,
      imageAsset: null,
      beforeAsset: null,
      afterAsset: null,
      altText: null,
      isVisible: true,
      displayOrder: index,
      createdByUserId: null,
      updatedByUserId: null,
      }),
    );

    await this.galleryRepository.save(seededItems);
    this.logger.log('Seeded default gallery items', {
      count: seededItems.length,
    });
  }

  private async backfillMissingCategories(): Promise<void> {
    const items = await this.galleryRepository.find();
    const itemsNeedingBackfill = items.filter(
      (item) => this.normalizeStringList(item.categories).length === 0,
    );

    if (itemsNeedingBackfill.length === 0) {
      return;
    }

    const backfilledItems = itemsNeedingBackfill.map((item) => ({
      ...item,
      categories: this.resolveStoredCategories(item),
    }));

    await this.galleryRepository.save(backfilledItems);
    this.logger.log('Backfilled gallery item categories', {
      count: backfilledItems.length,
    });
  }

  private async validateFiles(
    files: Array<Express.Multer.File | undefined>,
  ): Promise<void> {
    for (const file of files) {
      if (!file) {
        continue;
      }

      await FileValidationService.validateImageFile(file);
    }
  }

  private validateFilesForAssetType(
    assetType: GalleryAssetType,
    files: {
      imageFile?: Express.Multer.File;
      beforeImageFile?: Express.Multer.File;
      afterImageFile?: Express.Multer.File;
    },
  ): void {
    if (assetType === GalleryAssetType.SINGLE) {
      if (!files.imageFile) {
        throw new BadRequestException(
          'A single gallery item requires an image file',
        );
      }

      if (files.beforeImageFile || files.afterImageFile) {
        throw new BadRequestException(
          'Single gallery items cannot include before/after images',
        );
      }

      return;
    }

    if (!files.beforeImageFile || !files.afterImageFile) {
      throw new BadRequestException(
        'A comparison gallery item requires both before and after images',
      );
    }

    if (files.imageFile) {
      throw new BadRequestException(
        'Comparison gallery items cannot include a single image file',
      );
    }
  }

  private resolveDirectUploadAssets(
    assetType: GalleryAssetType,
    assets: {
      imageAsset?: CloudinaryAssetDto;
      beforeAsset?: CloudinaryAssetDto;
      afterAsset?: CloudinaryAssetDto;
    },
  ): {
    imageAsset: GalleryCloudinaryAsset | null;
    beforeAsset: GalleryCloudinaryAsset | null;
    afterAsset: GalleryCloudinaryAsset | null;
  } {
    if (assetType === GalleryAssetType.SINGLE) {
      if (!assets.imageAsset) {
        throw new BadRequestException(
          'A single gallery item requires Cloudinary image metadata',
        );
      }

      if (assets.beforeAsset || assets.afterAsset) {
        throw new BadRequestException(
          'Single gallery items cannot include before/after assets',
        );
      }

      return {
        imageAsset: this.normalizeCloudinaryAsset(assets.imageAsset),
        beforeAsset: null,
        afterAsset: null,
      };
    }

    if (!assets.beforeAsset || !assets.afterAsset) {
      throw new BadRequestException(
        'A comparison gallery item requires before and after Cloudinary metadata',
      );
    }

    if (assets.imageAsset) {
      throw new BadRequestException(
        'Comparison gallery items cannot include a single image asset',
      );
    }

    return {
      imageAsset: null,
      beforeAsset: this.normalizeCloudinaryAsset(assets.beforeAsset),
      afterAsset: this.normalizeCloudinaryAsset(assets.afterAsset),
    };
  }

  private normalizeCloudinaryAsset(
    asset: CloudinaryAssetDto,
  ): GalleryCloudinaryAsset {
    if (!asset.publicId.startsWith('quikspit/gallery/')) {
      throw new BadRequestException('Gallery assets must be uploaded to the gallery folder');
    }

    return {
      publicId: asset.publicId,
      secureUrl: asset.secureUrl,
      width: asset.width,
      height: asset.height,
      format: asset.format,
      bytes: asset.bytes,
      originalFilename: asset.originalFilename ?? null,
    };
  }

  private async resolveDisplayOrder(requestedOrder?: number): Promise<number> {
    if (requestedOrder !== undefined) {
      return requestedOrder;
    }

    const lastItem = await this.galleryRepository.findOne({
      order: {
        displayOrder: 'DESC',
      },
    });

    return lastItem ? lastItem.displayOrder + 1 : 0;
  }

  private async uploadAssets(
    assetType: GalleryAssetType,
    input: {
      imageFile?: Express.Multer.File;
      beforeImageFile?: Express.Multer.File;
      afterImageFile?: Express.Multer.File;
      uploadKey: string;
    },
  ): Promise<{
    imagePublicId: string | null;
    beforePublicId: string | null;
    afterPublicId: string | null;
  }> {
    const uploadedPublicIds: string[] = [];

    try {
      if (assetType === GalleryAssetType.SINGLE && input.imageFile) {
        const upload = await this.cloudinaryService.uploadBuffer(
          input.imageFile.buffer,
          {
            folder: 'quikspit/gallery',
            publicId: `${input.uploadKey}-single`,
            resourceType: 'image',
          },
        );
        uploadedPublicIds.push(upload.publicId);
        return {
          imagePublicId: upload.publicId,
          beforePublicId: null,
          afterPublicId: null,
        };
      }

      if (
        assetType === GalleryAssetType.COMPARISON &&
        input.beforeImageFile &&
        input.afterImageFile
      ) {
        const [beforeUpload, afterUpload] = await Promise.all([
          this.cloudinaryService.uploadBuffer(input.beforeImageFile.buffer, {
            folder: 'quikspit/gallery',
            publicId: `${input.uploadKey}-before`,
            resourceType: 'image',
          }),
          this.cloudinaryService.uploadBuffer(input.afterImageFile.buffer, {
            folder: 'quikspit/gallery',
            publicId: `${input.uploadKey}-after`,
            resourceType: 'image',
          }),
        ]);

        uploadedPublicIds.push(beforeUpload.publicId, afterUpload.publicId);
        return {
          imagePublicId: null,
          beforePublicId: beforeUpload.publicId,
          afterPublicId: afterUpload.publicId,
        };
      }
    } catch (error) {
      await this.deleteTrackedPublicIds(uploadedPublicIds);
      throw error;
    }

    throw new BadRequestException('Gallery assets were not provided correctly');
  }

  private buildUploadKey(title: string): string {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48);

    return `${slug || 'gallery-item'}-${Date.now()}-${randomUUID().slice(0, 8)}`;
  }

  private async deleteTrackedPublicIds(publicIds: string[]): Promise<void> {
    for (const publicId of publicIds) {
      if (!publicId) {
        continue;
      }

      try {
        await this.cloudinaryService.deleteFile(publicId);
      } catch (error) {
        this.logger.warn('Unable to delete gallery asset from Cloudinary', {
          publicId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  private getTrackedPublicIds(item: GalleryItemEntity): string[] {
    return [item.imagePublicId, item.beforePublicId, item.afterPublicId].filter(
      (value): value is string => Boolean(value),
    );
  }

  private async findOneOrThrow(id: string): Promise<GalleryItemEntity> {
    const item = await this.galleryRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Gallery item ${id} was not found`);
    }

    return item;
  }

  private normalizeCategories(
    categories: string[] | undefined,
    assetType: GalleryAssetType,
  ): string[] {
    const normalizedCategories = this.normalizeStringList(categories);
    if (normalizedCategories.length > 0) {
      return normalizedCategories;
    }

    return [assetType === GalleryAssetType.COMPARISON ? 'comparison' : 'showcase'];
  }

  private inferLegacyCategories(item: GalleryItemEntity): string[] {
    const normalizedTags = new Set(this.normalizeStringList(item.tags));

    if (item.assetType === GalleryAssetType.COMPARISON) {
      return ['comparison'];
    }

    if (normalizedTags.has('exterior')) {
      return ['exterior'];
    }

    if (normalizedTags.has('interior')) {
      return ['interior'];
    }

    if (normalizedTags.has('showcase')) {
      return ['showcase'];
    }

    return ['showcase'];
  }

  private resolveStoredCategories(item: GalleryItemEntity): string[] {
    const normalizedCategories = this.normalizeStringList(item.categories);
    if (normalizedCategories.length > 0) {
      return normalizedCategories;
    }

    return this.inferLegacyCategories(item);
  }

  private normalizeStringList(values: string[] | undefined): string[] {
    return Array.from(
      new Set(
        (values ?? [])
          .map((value) => value.trim())
          .filter(Boolean),
      ),
    );
  }

  private toPublicDto(item: GalleryItemEntity): GalleryItemDto {
    return {
      id: item.id,
      title: item.title,
      description: item.description ?? undefined,
      altText: item.altText ?? undefined,
      categories: this.resolveStoredCategories(item),
      tags: item.tags ?? [],
      imageUrl: item.imagePublicId ?? item.imageAsset?.secureUrl ?? undefined,
      beforeUrl: item.beforePublicId ?? item.beforeAsset?.secureUrl ?? undefined,
      afterUrl: item.afterPublicId ?? item.afterAsset?.secureUrl ?? undefined,
      createdAt: item.createdAt.toISOString(),
    };
  }

  private toAdminDto(item: GalleryItemEntity): GalleryAdminItemDto {
    return {
      ...this.toPublicDto(item),
      categories: this.resolveStoredCategories(item),
      tags: item.tags ?? [],
      assetType: item.assetType,
      displayOrder: item.displayOrder,
      isVisible: item.isVisible,
      imagePublicId: item.imagePublicId,
      beforePublicId: item.beforePublicId,
      afterPublicId: item.afterPublicId,
      updatedAt: item.updatedAt.toISOString(),
      createdByUserId: item.createdByUserId,
      updatedByUserId: item.updatedByUserId,
    };
  }
}
