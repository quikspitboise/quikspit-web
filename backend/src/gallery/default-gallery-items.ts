import { GalleryAssetType } from './entities/gallery-item.entity';

export type DefaultGalleryItemSeed = {
  id: string;
  title: string;
  description?: string;
  categories: string[];
  tags: string[];
  assetType: GalleryAssetType;
  imagePublicId?: string;
  beforePublicId?: string;
  afterPublicId?: string;
};

export const DEFAULT_GALLERY_ITEMS: DefaultGalleryItemSeed[] = [
  {
    id: 'detail-1',
    title: 'Exterior Detail',
    description: 'Full exterior restoration',
    categories: ['comparison'],
    tags: ['exterior', 'detailing', 'comparison'],
    assetType: GalleryAssetType.COMPARISON,
    beforePublicId: 'quikspit/gallery/vehicle1-before',
    afterPublicId: 'quikspit/gallery/vehicle1-after',
  },
  {
    id: 'detail-2',
    title: 'Interior Refresh',
    description: 'Complete interior transformation',
    categories: ['comparison'],
    tags: ['interior', 'detailing', 'comparison'],
    assetType: GalleryAssetType.COMPARISON,
    beforePublicId: 'quikspit/gallery/vehicle2-before',
    afterPublicId: 'quikspit/gallery/vehicle2-after',
  },
  {
    id: 'external-1',
    title: 'Professional Detailing Results',
    categories: ['exterior'],
    tags: ['exterior'],
    assetType: GalleryAssetType.SINGLE,
    imagePublicId: 'IMG_5095_molq77',
  },
  {
    id: 'external-2',
    title: 'Professional Detailing Results',
    categories: ['exterior'],
    tags: ['exterior'],
    assetType: GalleryAssetType.SINGLE,
    imagePublicId: 'IMG_5136_lrd9j9',
  },
  {
    id: 'external-3',
    title: 'Professional Detailing Results',
    categories: ['exterior'],
    tags: ['exterior'],
    assetType: GalleryAssetType.SINGLE,
    imagePublicId: 'IMG_5179_iksey6',
  },
  ...Array.from(
    { length: 9 },
    (_, index): DefaultGalleryItemSeed => ({
      id: `showcase-${index + 1}`,
      title: 'Professional Detailing Results',
      categories: ['exterior'],
      tags: ['showcase', 'exterior'],
      assetType: GalleryAssetType.SINGLE,
      imagePublicId: `quikspit/gallery/ex_${index + 1}`,
    }),
  ),
];
