import { Injectable } from '@nestjs/common';

export interface GalleryItemDto {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  // For comparison images (before/after) - these are Cloudinary public IDs
  beforeUrl?: string;
  afterUrl?: string;
  // For single images - this is a Cloudinary public ID
  imageUrl?: string;
  createdAt: string;
}

@Injectable()
export class GalleryService {
  /**
   * Generate a Cloudinary public ID for an image
   * The frontend uses CldImage which constructs the full URL from the public ID
   * @param name - The image name (e.g., 'vehicle1-before')
   */
  private publicId(name: string): string {
    return `quickspit/gallery/${name}`;
  }

  async list(): Promise<GalleryItemDto[]> {
    // Return Cloudinary public IDs for gallery images
    // The frontend CldImage component will construct the full URL
    const asset = (name: string) => this.publicId(name);
    
    return [
      // Comparison images (before/after)
      {
        id: 'detail-1',
        title: 'Exterior Detail',
        description: 'Full exterior restoration',
        tags: ['exterior', 'detailing', 'comparison'],
        beforeUrl: asset('vehicle1-before'),
        afterUrl: asset('vehicle1-after'),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'detail-2',
        title: 'Interior Refresh',
        description: 'Complete interior transformation',
        tags: ['interior', 'detailing', 'comparison'],
        beforeUrl: asset('vehicle2-before'),
        afterUrl: asset('vehicle2-after'),
        createdAt: new Date().toISOString(),
      },
      // Single showcase images
      {
        id: 'showcase-1',
        title: 'Professional Detailing Results',
        tags: ['showcase'],
        imageUrl: asset('ex_1'),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'showcase-2',
        title: 'Professional Detailing Results',
        tags: ['showcase'],
        imageUrl: asset('ex_2'),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'showcase-3',
        title: 'Professional Detailing Results',
        tags: ['showcase'],
        imageUrl: asset('ex_3'),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'showcase-4',
        title: 'Professional Detailing Results',
        tags: ['showcase'],
        imageUrl: asset('ex_4'),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'showcase-5',
        title: 'Professional Detailing Results',
        tags: ['showcase'],
        imageUrl: asset('ex_5'),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'showcase-6',
        title: 'Professional Detailing Results',
        tags: ['showcase'],
        imageUrl: asset('ex_6'),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'showcase-7',
        title: 'Professional Detailing Results',
        tags: ['showcase'],
        imageUrl: asset('ex_7'),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'showcase-8',
        title: 'Professional Detailing Results',
        tags: ['showcase'],
        imageUrl: asset('ex_8'),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'showcase-9',
        title: 'Professional Detailing Results',
        tags: ['showcase'],
        imageUrl: asset('ex_9'),
        createdAt: new Date().toISOString(),
      },
    ];
  }
}