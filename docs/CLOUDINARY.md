# Cloudinary Integration

QuikSpit uses [Cloudinary](https://cloudinary.com) for image and video hosting with automatic optimization and transformations.

## Setup

### 1. Create Cloudinary Account

Sign up at [cloudinary.com](https://cloudinary.com) and get your credentials from the [API Keys page](https://console.cloudinary.com/settings/api-keys).

### 2. Configure Environment Variables

**Backend** (`.env`):
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Frontend** (`.env.local`):
```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

### 3. Run Migration Script

Upload existing assets to Cloudinary:

```bash
cd backend
pnpm ts-node scripts/migrate-to-cloudinary.ts
```

This will:
- Upload all gallery images to `quikspit/gallery/`
- Upload static assets to `quikspit/static/`
- Generate a mapping file and TypeScript constants

## Folder Structure in Cloudinary

```
quikspit/
├── gallery/           # Gallery images (before/after)
│   ├── vehicle1-before
│   ├── vehicle1-after
│   ├── ex_1
│   └── ...
├── static/            # Static website assets
│   ├── hero-fallback
│   └── owner
├── videos/            # Video content
│   └── hero
└── uploads/           # User-uploaded content
    └── contact-{timestamp}
```

## Usage

### Frontend Components

The project uses `next-cloudinary` for optimized image and video delivery:

```tsx
import { CldImage, CldVideoPlayer } from 'next-cloudinary';
import { CLOUDINARY_ASSETS } from '@/lib/cloudinary';

// Image
<CldImage
  src={CLOUDINARY_ASSETS.static.owner}
  alt="Owner photo"
  width={300}
  height={300}
/>

// Video
<CldVideoPlayer
  src={CLOUDINARY_ASSETS.videos.hero}
  width="1920"
  height="1080"
  autoPlay="always"
  muted
  loop
/>
```

### Backend Upload Service

The `CloudinaryService` handles uploads from the contact form:

```typescript
import { CloudinaryService } from './cloudinary/cloudinary.service';

@Injectable()
export class ContactService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async handleUpload(file: Express.Multer.File) {
    const result = await this.cloudinaryService.uploadBuffer(file.buffer, {
      folder: 'quikspit/uploads',
      publicId: `contact-${Date.now()}`,
    });
    return result.secureUrl;
  }
}
```

## Automatic Optimizations

Cloudinary automatically:
- Serves images in modern formats (WebP, AVIF) based on browser support
- Optimizes quality based on content
- Applies responsive sizing
- Caches at edge locations for faster delivery

## Transformations

Apply transformations via props:

```tsx
<CldImage
  src="quikspit/gallery/vehicle1-after"
  width={800}
  height={600}
  crop="fill"
  gravity="auto"
  quality="auto"
/>
```

## Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [next-cloudinary Documentation](https://next.cloudinary.dev)
- [Image Transformations](https://cloudinary.com/documentation/image_transformations)
- [Video Transformations](https://cloudinary.com/documentation/video_manipulation_and_delivery)
