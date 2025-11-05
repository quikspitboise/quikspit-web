import { Injectable } from '@nestjs/common';

export interface GalleryItemDto {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  // For comparison images (before/after)
  beforeUrl?: string;
  afterUrl?: string;
  // For single images
  imageUrl?: string;
  createdAt: string;
}

@Injectable()
export class GalleryService {
  private readonly baseUrl: string;

  constructor() {
    // Use BASE_URL from env, fallback to Render public URL, fallback to localhost
    const backendUrl =
      process.env.BASE_URL ||
      process.env.BACKEND_PUBLIC_URL ||
      'https://quickspit.onrender.com';
    this.baseUrl = backendUrl;
  }

  async list(): Promise<GalleryItemDto[]> {
    // Return public URLs for gallery images
    const asset = (name: string) => `${this.baseUrl}/resources/gallery/${name}`;
    return [
      // Comparison images (before/after)
      {
        id: 'detail-1',
        title: 'Exterior Detail',
        description: 'Full exterior restoration',
        tags: ['exterior', 'detailing', 'comparison'],
        beforeUrl: asset('vehicle1-before.jpg'),
        afterUrl: asset('vehicle1-after.jpg'),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'detail-2',
        title: 'Interior Refresh',
        description: 'Complete interior transformation',
        tags: ['interior', 'detailing', 'comparison'],
        beforeUrl: asset('vehicle2-before.jpg'),
        afterUrl: asset('vehicle2-after.jpg'),
        createdAt: new Date().toISOString(),
      },
      // Single showcase images
      {
        id: 'showcase-1',
        title: 'Professional Detailing Results',
        tags: ['showcase'],
        imageUrl: asset('ex_1.jpg'),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'showcase-2',
        title: 'Professional Detailing Results',
        tags: ['showcase'],
        imageUrl: asset('ex_2.jpg'),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'showcase-3',
        title: 'Professional Detailing Results',
        tags: ['showcase'],
        imageUrl: asset('ex_3.jpg'),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'showcase-4',
        title: 'Professional Detailing Results',
        tags: ['showcase'],
        imageUrl: asset('ex_4.jpg'),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'showcase-5',
        title: 'Professional Detailing Results',
        tags: ['showcase'],
        imageUrl: asset('ex_5.jpg'),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'showcase-6',
        title: 'Professional Detailing Results',
        tags: ['showcase'],
        imageUrl: asset('ex_6.jpg'),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'showcase-7',
        title: 'Professional Detailing Results',
        tags: ['showcase'],
        imageUrl: asset('ex_7.jpg'),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'showcase-8',
        title: 'Professional Detailing Results',
        tags: ['showcase'],
        imageUrl: asset('ex_8.jpg'),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'showcase-9',
        title: 'Professional Detailing Results',
        tags: ['showcase'],
        imageUrl: asset('ex_9.jpg'),
        createdAt: new Date().toISOString(),
      },
    ];
  }
}