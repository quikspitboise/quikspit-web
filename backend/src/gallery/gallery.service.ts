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
import {
  GalleryAssetType,
  GalleryItemEntity,
} from './entities/gallery-item.entity';

export interface GalleryItemDto {
  id: string;
  title: string;
  description?: string;
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
    files: GalleryUploadFiles,
  ): Promise<GalleryAdminItemDto> {
    const imageFile = files.image?.[0];
    const beforeImageFile = files.beforeImage?.[0];
    const afterImageFile = files.afterImage?.[0];

    this.validateFilesForAssetType(dto.assetType, {
      imageFile,
      beforeImageFile,
      afterImageFile,
    });

    await this.validateFiles([imageFile, beforeImageFile, afterImageFile]);

    const nextDisplayOrder = await this.resolveDisplayOrder(dto.displayOrder);
    const uploadKey = this.buildUploadKey(dto.title);

    const uploadedAssets = await this.uploadAssets(dto.assetType, {
      imageFile,
      beforeImageFile,
      afterImageFile,
      uploadKey,
    });

    const item = this.galleryRepository.create({
      id: randomUUID(),
      title: dto.title,
      description: dto.description ?? null,
      categories: this.normalizeCategories(dto.categories, dto.assetType),
      tags: this.normalizeStringList(dto.tags),
      assetType: dto.assetType,
      imagePublicId: uploadedAssets.imagePublicId,
      beforePublicId: uploadedAssets.beforePublicId,
      afterPublicId: uploadedAssets.afterPublicId,
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

    if (dto.categories !== undefined) {
      item.categories = this.normalizeCategories(dto.categories, item.assetType);
    }

    if (dto.tags !== undefined) {
      item.tags = this.normalizeStringList(dto.tags);
    }

    if (dto.displayOrder !== undefined) {
      item.displayOrder = dto.displayOrder;
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
    files: GalleryUploadFiles,
  ): Promise<GalleryAdminItemDto> {
    const item = await this.findOneOrThrow(id);
    const imageFile = files.image?.[0];
    const beforeImageFile = files.beforeImage?.[0];
    const afterImageFile = files.afterImage?.[0];

    this.validateFilesForAssetType(item.assetType, {
      imageFile,
      beforeImageFile,
      afterImageFile,
    });

    await this.validateFiles([imageFile, beforeImageFile, afterImageFile]);

    const previousPublicIds = this.getTrackedPublicIds(item);
    const uploadedAssets = await this.uploadAssets(item.assetType, {
      imageFile,
      beforeImageFile,
      afterImageFile,
      uploadKey: this.buildUploadKey(item.title),
    });

    item.imagePublicId =
      uploadedAssets.imagePublicId ?? item.imagePublicId ?? null;
    item.beforePublicId =
      uploadedAssets.beforePublicId ?? item.beforePublicId ?? null;
    item.afterPublicId =
      uploadedAssets.afterPublicId ?? item.afterPublicId ?? null;
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

    await this.deleteTrackedPublicIds(this.getTrackedPublicIds(item));
    await this.galleryRepository.remove(item);

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

      const deleted = await this.cloudinaryService.deleteFile(publicId);
      if (!deleted) {
        throw new BadRequestException(
          `Unable to delete gallery asset ${publicId}`,
        );
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
      categories: this.resolveStoredCategories(item),
      tags: item.tags ?? [],
      imageUrl: item.imagePublicId ?? undefined,
      beforeUrl: item.beforePublicId ?? undefined,
      afterUrl: item.afterPublicId ?? undefined,
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
      updatedAt: item.updatedAt.toISOString(),
      createdByUserId: item.createdByUserId,
      updatedByUserId: item.updatedByUserId,
    };
  }
}
