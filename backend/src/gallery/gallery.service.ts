import { Injectable } from '@nestjs/common';

export interface GalleryItemDto {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  beforeUrl: string;
  afterUrl: string;
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
    // Always return public URLs for images
    const asset = (name: string) => `${this.baseUrl}/resources/sample/${name}`;
    return [
      {
        id: 'sample-1',
        title: 'Sample Vehicle 1',
        description: 'Placeholder comparison',
        tags: ['sample'],
        beforeUrl: asset('vehicle1-before.jpg'),
        afterUrl: asset('vehicle1-after.jpg'),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'sample-2',
        title: 'Sample Vehicle 2',
        description: 'Placeholder comparison',
        tags: ['sample'],
        beforeUrl: asset('vehicle2-before.jpg'),
        afterUrl: asset('vehicle2-after.jpg'),
        createdAt: new Date().toISOString(),
      },
    ];
  }
}