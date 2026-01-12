import { GalleryItem } from '@/components/gallery-grid';

/**
 * Static gallery items with Cloudinary public IDs
 * Images are served directly from Cloudinary CDN - no backend needed
 */
export const GALLERY_ITEMS: GalleryItem[] = [
  // Comparison images (before/after)
  {
    id: 'detail-1',
    title: 'Exterior Detail',
    description: 'Full exterior restoration',
    beforeUrl: 'quickspit/gallery/vehicle1-before',
    afterUrl: 'quickspit/gallery/vehicle1-after',
  },
  {
    id: 'detail-2',
    title: 'Interior Refresh',
    description: 'Complete interior transformation',
    beforeUrl: 'quickspit/gallery/vehicle2-before',
    afterUrl: 'quickspit/gallery/vehicle2-after',
  },
  // Single showcase images
  {
    id: 'showcase-1',
    title: 'Professional Detailing Results',
    imageUrl: 'quickspit/gallery/ex_1',
  },
  {
    id: 'showcase-2',
    title: 'Professional Detailing Results',
    imageUrl: 'quickspit/gallery/ex_2',
  },
  {
    id: 'showcase-3',
    title: 'Professional Detailing Results',
    imageUrl: 'quickspit/gallery/ex_3',
  },
  {
    id: 'showcase-4',
    title: 'Professional Detailing Results',
    imageUrl: 'quickspit/gallery/ex_4',
  },
  {
    id: 'showcase-5',
    title: 'Professional Detailing Results',
    imageUrl: 'quickspit/gallery/ex_5',
  },
  {
    id: 'showcase-6',
    title: 'Professional Detailing Results',
    imageUrl: 'quickspit/gallery/ex_6',
  },
  {
    id: 'showcase-7',
    title: 'Professional Detailing Results',
    imageUrl: 'quickspit/gallery/ex_7',
  },
  {
    id: 'showcase-8',
    title: 'Professional Detailing Results',
    imageUrl: 'quickspit/gallery/ex_8',
  },
  {
    id: 'showcase-9',
    title: 'Professional Detailing Results',
    imageUrl: 'quickspit/gallery/ex_9',
  },
];
