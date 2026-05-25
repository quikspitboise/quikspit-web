import { GalleryService } from './gallery.service';
import { GalleryAssetType } from './entities/gallery-item.entity';

describe('GalleryService', () => {
  const repositoryMock = {
    count: jest.fn(),
    create: jest.fn((entity) => entity),
    createQueryBuilder: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const cloudinaryMock = {
    uploadBuffer: jest.fn(),
    deleteFile: jest.fn(),
  };

  const loggerMock = {
    error: jest.fn(),
    log: jest.fn(),
  };

  let service: GalleryService;

  beforeEach(() => {
    jest.clearAllMocks();
    repositoryMock.count.mockResolvedValue(1);
    service = new GalleryService(
      repositoryMock as any,
      cloudinaryMock as any,
      loggerMock as any,
    );
  });

  it('creates a single-image gallery item and persists the uploaded Cloudinary asset', async () => {
    repositoryMock.createQueryBuilder.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ maxDisplayOrder: 2 }),
    });
    repositoryMock.save.mockImplementation(async (entity) => ({
      ...entity,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    }));

    const item = await service.create('user_owner', {
      title: 'Wheel detail',
      description: 'Freshly cleaned wheels',
      categories: ['exterior', 'showcase'],
      tags: ['wheels', 'detail'],
      assetType: GalleryAssetType.SINGLE,
      imageAsset: {
        publicId: 'quikspit/gallery/new-item-single',
        secureUrl: 'https://res.cloudinary.com/demo/image/upload/new-item.jpg',
        width: 1200,
        height: 800,
        format: 'jpg',
        bytes: 1024,
      },
    });

    expect(cloudinaryMock.uploadBuffer).not.toHaveBeenCalled();
    expect(repositoryMock.save).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Wheel detail',
        createdByUserId: 'user_owner',
        imagePublicId: 'quikspit/gallery/new-item-single',
      }),
    );
    expect(item.imageUrl).toBe('quikspit/gallery/new-item-single');
  });

  it('deletes tracked Cloudinary assets before removing the gallery item record', async () => {
    repositoryMock.findOne.mockResolvedValue({
      id: 'detail-1',
      title: 'Exterior Detail',
      description: 'Full exterior restoration',
      categories: ['comparison', 'exterior'],
      tags: ['exterior'],
      assetType: GalleryAssetType.COMPARISON,
      imagePublicId: null,
      beforePublicId: 'quikspit/gallery/before',
      afterPublicId: 'quikspit/gallery/after',
      displayOrder: 0,
      createdByUserId: null,
      updatedByUserId: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    cloudinaryMock.deleteFile.mockResolvedValue(true);

    await service.remove('detail-1', 'user_owner');

    expect(cloudinaryMock.deleteFile).toHaveBeenNthCalledWith(
      1,
      'quikspit/gallery/before',
    );
    expect(cloudinaryMock.deleteFile).toHaveBeenNthCalledWith(
      2,
      'quikspit/gallery/after',
    );
    expect(repositoryMock.remove).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'detail-1' }),
    );
  });

  it('falls back to legacy single categories for existing items with empty categories', async () => {
    repositoryMock.find.mockResolvedValue([
      {
        id: 'external-1',
        title: 'Professional Detailing Results',
        description: null,
        categories: [],
        tags: ['exterior'],
        assetType: GalleryAssetType.SINGLE,
        imagePublicId: 'IMG_5095_molq77',
        beforePublicId: null,
        afterPublicId: null,
        displayOrder: 0,
        createdByUserId: null,
        updatedByUserId: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ]);

    const items = await service.listAdmin();

    expect(items[0]?.categories).toEqual(['exterior']);
  });
});
