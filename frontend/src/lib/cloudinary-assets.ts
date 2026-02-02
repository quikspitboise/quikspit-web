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
 * 
 * NOTE: This file is intentionally NOT a client component so it can be
 * imported by both server and client components.
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
        hero: 'copy_84B200F5-6F45-4C16-B685-5944D3E2B2CC_fgxfbu',
    },
} as const;
