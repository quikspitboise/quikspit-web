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
    id: 'detail-3',
    title: 'Interior Before & After',
    description: 'Interior transformation',
    categories: ['comparison'],
    tags: ['comparison', 'interior'],
    assetType: GalleryAssetType.COMPARISON,
    beforePublicId: 'IMG_5241_m0qn8v',
    afterPublicId: 'IMG_5245_qr17yh',
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
  {
    id: 'external-4',
    title: 'Professional Detailing Results',
    categories: ['exterior'],
    tags: ['exterior'],
    assetType: GalleryAssetType.SINGLE,
    imagePublicId: 'IMG_5249_dzokle',
  },
  {
    id: 'external-5',
    title: 'Professional Detailing Results',
    categories: ['exterior'],
    tags: ['exterior'],
    assetType: GalleryAssetType.SINGLE,
    imagePublicId: 'IMG_5243_s1s881',
  },
  {
    id: 'interior-1',
    title: 'Interior Detailing Results',
    categories: ['interior'],
    tags: ['interior'],
    assetType: GalleryAssetType.SINGLE,
    imagePublicId: 'IMG_5235_mw9hz4',
  },
  {
    id: 'interior-2',
    title: 'Interior Detailing Results',
    categories: ['interior'],
    tags: ['interior'],
    assetType: GalleryAssetType.SINGLE,
    imagePublicId: 'IMG_5233_yldb7a',
  },
  {
    id: 'interior-3',
    title: 'Interior Detailing Results',
    categories: ['interior'],
    tags: ['interior'],
    assetType: GalleryAssetType.SINGLE,
    imagePublicId: 'IMG_5234_d2swmm',
  },
  {
    id: 'interior-4',
    title: 'Interior Detailing Results',
    categories: ['interior'],
    tags: ['interior'],
    assetType: GalleryAssetType.SINGLE,
    imagePublicId: 'IMG_5244_pdadbl',
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
