'use client';

import { CldImage as NextCldImage, CldVideoPlayer as NextCldVideoPlayer } from 'next-cloudinary';
import type { CldImageProps, CldVideoPlayerProps } from 'next-cloudinary';

/**
 * Cloudinary Assets Configuration
 * 
 * These are the public IDs for assets stored in Cloudinary.
 * After running the migration script, these should match your
 * actual Cloudinary asset paths.
 * 
 * Folder structure:
 * - quikspit/gallery/ - Gallery images (before/after comparisons)
 * - quikspit/static/  - Static assets (hero fallback, owner photo)
 * - quikspit/videos/  - Video content
 * - quikspit/uploads/ - User-uploaded content
 */
export const CLOUDINARY_ASSETS = {
  // Gallery images (before/after comparisons)
  gallery: {
    vehicle1Before: 'quikspit/gallery/vehicle1-before',
    vehicle1After: 'quikspit/gallery/vehicle1-after',
    vehicle2Before: 'quikspit/gallery/vehicle2-before',
    vehicle2After: 'quikspit/gallery/vehicle2-after',
    example1: 'quikspit/gallery/ex_1',
    example2: 'quikspit/gallery/ex_2',
    example3: 'quikspit/gallery/ex_3',
    example4: 'quikspit/gallery/ex_4',
    example5: 'quikspit/gallery/ex_5',
    example6: 'quikspit/gallery/ex_6',
    example7: 'quikspit/gallery/ex_7',
    example8: 'quikspit/gallery/ex_8',
    example9: 'quikspit/gallery/ex_9',
  },
  // Static assets
  static: {
    heroFallback: 'quikspit/static/hero-fallback',
    owner: 'quikspit/static/owner',
  },
  // Videos
  videos: {
    hero: 'quikspit/videos/hero', // Update with your actual hero video public ID
  },
} as const;

/**
 * Type-safe wrapper for CldImage with QuikSpit defaults
 */
export function CloudinaryImage({
  className = '',
  ...props
}: CldImageProps) {
  return (
    <NextCldImage
      {...props}
      className={className}
    />
  );
}

/**
 * Type-safe wrapper for CldVideoPlayer with QuikSpit defaults
 */
export function CloudinaryVideo({
  className = '',
  autoPlay = true,
  muted = true,
  loop = true,
  controls = false,
  ...props
}: CldVideoPlayerProps & { className?: string }) {
  return (
    <div className={className}>
      <NextCldVideoPlayer
        autoPlay={autoPlay ? 'always' : false}
        muted={muted}
        loop={loop}
        controls={controls}
        {...props}
      />
    </div>
  );
}

// Re-export for convenience
export { CldImage, CldVideoPlayer } from 'next-cloudinary';
