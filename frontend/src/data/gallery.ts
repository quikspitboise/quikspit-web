import type { GalleryItem } from '@/lib/gallery';

/**
 * Static gallery items with Cloudinary public IDs
 * Images are served directly from Cloudinary CDN - no backend needed
 *
 * The `categories` field drives the filter tabs on the gallery page.
 * Adding items with a new category string will automatically create
 * a new filter tab — no code changes required.
 */
export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'detail-1',
    title: 'Exterior Detail',
    description: 'Full exterior restoration',
    categories: ['comparison', 'exterior'],
    tags: ['detailing', 'comparison', 'exterior'],
    beforeUrl: 'quikspit/gallery/vehicle1-before',
    afterUrl: 'quikspit/gallery/vehicle1-after',
  },
  {
    id: 'detail-2',
    title: 'Interior Refresh',
    description: 'Complete interior transformation',
    categories: ['comparison', 'interior'],
    tags: ['detailing', 'comparison', 'interior'],
    beforeUrl: 'quikspit/gallery/vehicle2-before',
    afterUrl: 'quikspit/gallery/vehicle2-after',
  },
  {
    id: 'detail-3',
    title: 'Interior Before & After',
    description: 'Interior transformation',
    categories: ['comparison', 'interior'],
    tags: ['comparison', 'interior'],
    beforeUrl: 'IMG_5241_m0qn8v',
    afterUrl: 'IMG_5245_qr17yh',
  },
  {
    id: 'external-1',
    title: 'Professional Detailing Results',
    categories: ['exterior'],
    tags: ['exterior'],
    imageUrl: 'IMG_5095_molq77',
  },
  {
    id: 'external-2',
    title: 'Professional Detailing Results',
    categories: ['exterior'],
    tags: ['exterior'],
    imageUrl: 'IMG_5136_lrd9j9',
  },
  {
    id: 'external-3',
    title: 'Professional Detailing Results',
    categories: ['exterior'],
    tags: ['exterior'],
    imageUrl: 'IMG_5179_iksey6',
  },
  {
    id: 'external-4',
    title: 'Professional Detailing Results',
    categories: ['exterior'],
    tags: ['exterior'],
    imageUrl: 'IMG_5249_dzokle',
  },
  {
    id: 'external-5',
    title: 'Professional Detailing Results',
    categories: ['exterior'],
    tags: ['exterior'],
    imageUrl: 'IMG_5243_s1s881',
  },
  {
    id: 'interior-1',
    title: 'Interior Detailing Results',
    categories: ['interior'],
    tags: ['interior'],
    imageUrl: 'IMG_5235_mw9hz4',
  },
  {
    id: 'interior-2',
    title: 'Interior Detailing Results',
    categories: ['interior'],
    tags: ['interior'],
    imageUrl: 'IMG_5233_yldb7a',
  },
  {
    id: 'interior-3',
    title: 'Interior Detailing Results',
    categories: ['interior'],
    tags: ['interior'],
    imageUrl: 'IMG_5234_d2swmm',
  },
  {
    id: 'interior-4',
    title: 'Interior Detailing Results',
    categories: ['interior'],
    tags: ['interior'],
    imageUrl: 'IMG_5244_pdadbl',
  },
  {
    id: 'showcase-1',
    title: 'Professional Detailing Results',
    categories: ['exterior'],
    tags: ['showcase', 'exterior'],
    imageUrl: 'quikspit/gallery/ex_1',
  },
  {
    id: 'showcase-2',
    title: 'Professional Detailing Results',
    categories: ['exterior'],
    tags: ['showcase', 'exterior'],
    imageUrl: 'quikspit/gallery/ex_2',
  },
  {
    id: 'showcase-3',
    title: 'Professional Detailing Results',
    categories: ['exterior'],
    tags: ['showcase', 'exterior'],
    imageUrl: 'quikspit/gallery/ex_3',
  },
  {
    id: 'showcase-4',
    title: 'Professional Detailing Results',
    categories: ['exterior'],
    tags: ['showcase', 'exterior'],
    imageUrl: 'quikspit/gallery/ex_4',
  },
  {
    id: 'showcase-5',
    title: 'Professional Detailing Results',
    categories: ['exterior'],
    tags: ['showcase', 'exterior'],
    imageUrl: 'quikspit/gallery/ex_5',
  },
  {
    id: 'showcase-6',
    title: 'Professional Detailing Results',
    categories: ['exterior'],
    tags: ['showcase', 'exterior'],
    imageUrl: 'quikspit/gallery/ex_6',
  },
  {
    id: 'showcase-7',
    title: 'Professional Detailing Results',
    categories: ['exterior'],
    tags: ['showcase', 'exterior'],
    imageUrl: 'quikspit/gallery/ex_7',
  },
  {
    id: 'showcase-8',
    title: 'Professional Detailing Results',
    categories: ['exterior'],
    tags: ['showcase', 'exterior'],
    imageUrl: 'quikspit/gallery/ex_8',
  },
  {
    id: 'showcase-9',
    title: 'Professional Detailing Results',
    categories: ['exterior'],
    tags: ['showcase', 'exterior'],
    imageUrl: 'quikspit/gallery/ex_9',
  },
];
