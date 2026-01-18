'use client';

import { CldImage } from 'next-cloudinary';
import { CLOUDINARY_ASSETS } from '@/lib/cloudinary-assets';

/**
 * Client component for rendering the owner image.
 * Separated to allow the About page to remain a server component for metadata.
 */
export function OwnerImage() {
    const ownerSrc = CLOUDINARY_ASSETS.static.owner;

    if (!ownerSrc) {
        // Fallback avatar
        return (
            <div className="w-full h-full flex items-center justify-center">
                <svg className="w-24 h-24 text-neutral-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
            </div>
        );
    }

    return (
        <CldImage
            src={ownerSrc}
            alt="Garret, Owner of QuikSpit Auto Detailing"
            fill
            className="object-cover"
            sizes="300px"
            priority
        />
    );
}
