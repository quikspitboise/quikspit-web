'use client';

import { CldImage as NextCldImage, CldVideoPlayer as NextCldVideoPlayer } from 'next-cloudinary';
import type { CldImageProps, CldVideoPlayerProps } from 'next-cloudinary';

// Re-export CLOUDINARY_ASSETS from the shared config file for backwards compatibility
export { CLOUDINARY_ASSETS } from './cloudinary-assets';

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
